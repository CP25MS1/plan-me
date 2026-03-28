package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.*;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeScope;
import capstone.ms.api.modules.itinerary.dto.trip_version.ApplyTripVersionResponse;
import capstone.ms.api.modules.itinerary.dto.trip_version.BaseTripVersionDto;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionRequest;
import capstone.ms.api.modules.itinerary.dto.trip_version.TripVersionDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripVersion;
import capstone.ms.api.modules.itinerary.entities.TripVersionSnapshot;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimePublisher;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.TripVersionRepository;
import capstone.ms.api.modules.itinerary.repositories.TripVersionSnapshotRepository;
import capstone.ms.api.modules.itinerary.services.trip_version.TripVersionDtoFactory;
import capstone.ms.api.modules.itinerary.services.trip_version.TripVersionSnapshotApplier;
import capstone.ms.api.modules.itinerary.services.trip_version.TripVersionSnapshotCodec;
import capstone.ms.api.modules.itinerary.services.trip_version.TripVersionSnapshotGraphInitializer;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.mappers.UserMapper;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

@Service
@AllArgsConstructor
public class TripVersionService {
    private final TripVersionRepository tripVersionRepository;
    private final TripVersionSnapshotRepository tripVersionSnapshotRepository;
    private final TripAccessService tripAccessService;
    private final UserMapper userMapper;
    private final TripMapper tripMapper;
    private final TripRepository tripRepository;
    private final TripVersionSnapshotCodec snapshotCodec;
    private final TripVersionSnapshotGraphInitializer snapshotGraphInitializer;
    private final TripVersionSnapshotApplier snapshotApplier;
    private final TripVersionDtoFactory tripVersionDtoFactory;
    private final TripRealtimePublisher tripRealtimePublisher;

    @Transactional
    public BaseTripVersionDto createVersion(Integer tripId, CreateTripVersionRequest request, User currentUser) {
        Trip trip = tripAccessService.getTripWithOwnerAccess(currentUser, tripId);
        String versionName = request.getVersionName().trim();

        int count = tripVersionRepository.countByTripId(tripId);
        if (count >= 3) {
            throw new BadRequestException("tripVersion.400.maxReached");
        }

        if (tripVersionRepository.existsByTripIdAndVersionName(tripId, versionName)) {
            throw new ConflictException("tripVersion.409.duplicate");
        }

        tripVersionRepository.clearCurrentForTrip(tripId);

        TripVersion tripVersion = new TripVersion();
        tripVersion.setTrip(trip);
        tripVersion.setVersionName(versionName);
        tripVersion.setSnapshotTripName(trip.getName());
        tripVersion.setSnapshotStartDate(trip.getStartDate());
        tripVersion.setSnapshotEndDate(trip.getEndDate());
        tripVersion.setCreatedAt(Instant.now());
        tripVersion.setCreatedBy(currentUser);
        tripVersion.setIsCurrent(true);

        TripVersion saved = tripVersionRepository.saveAndFlush(tripVersion);

        snapshotGraphInitializer.initialize(trip);
        TripOverviewDto tripOverview = tripMapper.tripToTripOverviewDto(trip);
        Map<String, Object> snapshot = snapshotCodec.encodeOverview(tripOverview);

        TripVersionSnapshot tripVersionSnapshot = new TripVersionSnapshot();
        tripVersionSnapshot.setTripVersion(saved);
        tripVersionSnapshot.setSnapshotSchemaVersion((short) 1);
        tripVersionSnapshot.setSnapshot(snapshot);
        tripVersionSnapshotRepository.save(tripVersionSnapshot);

        PublicUserInfo createdBy = userMapper.userToPublicUserInfo(currentUser);

        return BaseTripVersionDto.builder()
                .id(saved.getId())
                .tripId(trip.getId())
                .versionName(saved.getVersionName())
                .createdAt(saved.getCreatedAt())
                .createdBy(createdBy)
                .appliedAt(saved.getAppliedAt())
                .appliedBy(null)
                .isCurrent(saved.getIsCurrent())
                .snapshotSchemaVersion((short) 1)
                .build();
    }

    @Transactional
    public ApplyTripVersionResponse applyVersion(Integer tripId, Integer versionId, User currentUser) {
        Trip lockedTrip = tripRepository.findByIdForUpdate(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));

        if (lockedTrip.getOwner() == null || !lockedTrip.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("trip.403");
        }

        TripVersion tripVersion = tripVersionRepository.findById(versionId)
                .orElseThrow(() -> new NotFoundException("tripVersion.404"));

        if (tripVersion.getTrip() == null || !tripVersion.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("tripVersion.404");
        }

        TripVersionSnapshot snapshotEntity = tripVersionSnapshotRepository.findById(versionId)
                .orElseThrow(() -> new ServerErrorException("500"));

        TripOverviewDto snapshotOverview = snapshotCodec.decodeOrThrow(snapshotEntity);
        if (snapshotOverview.getId() != null && !Objects.equals(snapshotOverview.getId(), tripId)) {
            throw new ServerErrorException("500");
        }

        snapshotApplier.applySnapshot(tripId, lockedTrip, tripVersion, snapshotOverview, currentUser);

        tripRepository.save(lockedTrip);

        // Clear any existing current flag for this trip (single update statement)
        tripVersionRepository.clearCurrentForTrip(tripId);

        tripVersion.setIsCurrent(true);
        tripVersion.setAppliedAt(Instant.now());
        tripVersion.setAppliedBy(currentUser);

        TripVersion saved = tripVersionRepository.saveAndFlush(tripVersion);

        Short snapshotSchemaVersion = snapshotEntity.getSnapshotSchemaVersion() != null
                ? snapshotEntity.getSnapshotSchemaVersion()
                : (short) 1;

        TripVersionDto dto = tripVersionDtoFactory.from(saved, snapshotSchemaVersion, null);

        tripRealtimePublisher.publishDataChangedAfterCommit(
                tripId,
                EnumSet.of(
                        TripRealtimeScope.HEADER,
                        TripRealtimeScope.RESERVATIONS,
                        TripRealtimeScope.WISHLIST,
                        TripRealtimeScope.DAILY_PLANS,
                        TripRealtimeScope.CHECKLIST,
                        TripRealtimeScope.TRIP_VERSION
                )
        );

        return ApplyTripVersionResponse.builder()
                .tripId(tripId)
                .appliedVersion(dto)
                .build();
    }

    @Transactional
    public List<TripVersionDto> listVersions(Integer tripId, Boolean includeSnapshot, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        List<TripVersion> versions = tripVersionRepository.findAllByTripIdWithUsers(tripId);
        List<TripVersionDto> results = new java.util.ArrayList<>(versions.size());

        Map<Integer, TripVersionSnapshot> snapshotsByVersionId = loadSnapshotsByVersionId(tripId, includeSnapshot);

        Supplier<TripOverviewDto> fallbackSupplier = new Supplier<>() {
            private TripOverviewDto cached;

            @Override
            public TripOverviewDto get() {
                if (cached == null) {
                    Trip detailedTrip = tripAccessService.getTripWithTripmateLevelAccess(currentUser, tripId);
                    snapshotGraphInitializer.initialize(detailedTrip);
                    cached = tripMapper.tripToTripOverviewDto(detailedTrip);
                }
                return cached;
            }
        };

        for (TripVersion v : versions) {
            TripVersionSnapshot snap = snapshotsByVersionId.get(v.getId());

            if (snap == null) {
                results.add(tripVersionDtoFactory.from(v));
            } else {
                TripOverviewDto snapshot = snapshotCodec.decodeOrFallback(snap, fallbackSupplier);
                results.add(tripVersionDtoFactory.from(v, snap.getSnapshotSchemaVersion(), snapshot));
            }
        }

        return results;
    }

    @Transactional
    public void deleteVersion(Integer tripId, Integer versionId, User currentUser) {
        tripAccessService.getTripWithOwnerAccess(currentUser, tripId);

        TripVersion tripVersion = tripVersionRepository.findById(versionId)
                .orElseThrow(() -> new NotFoundException("tripVersion.404"));

        if (tripVersion.getTrip() == null || !tripVersion.getTrip().getId().equals(tripId)) {
            throw new NotFoundException("tripVersion.404");
        }

        tripVersionRepository.delete(tripVersion);
    }

    private Map<Integer, TripVersionSnapshot> loadSnapshotsByVersionId(Integer tripId, Boolean includeSnapshot) {
        if (!Boolean.TRUE.equals(includeSnapshot)) {
            return Map.of();
        }

        List<TripVersionSnapshot> snapshots =
                tripVersionSnapshotRepository.findAllByTripIdOrderByTripVersionCreatedAtDesc(tripId);

        Map<Integer, TripVersionSnapshot> snapshotsByVersionId = new HashMap<>();
        for (TripVersionSnapshot snapshot : snapshots) {
            if (snapshot.getTripVersion() != null) {
                snapshotsByVersionId.put(snapshot.getTripVersion().getId(), snapshot);
            }
        }
        return snapshotsByVersionId;
    }
}
