package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionRequest;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionResponse;
import capstone.ms.api.modules.itinerary.dto.trip_version.TripVersionDto;
import capstone.ms.api.modules.itinerary.dto.trip_version.ApplyTripVersionResponse;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripVersion;
import capstone.ms.api.modules.itinerary.entities.TripVersionSnapshot;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.repositories.TripVersionRepository;
import capstone.ms.api.modules.itinerary.repositories.TripVersionSnapshotRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.mappers.UserMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.time.Instant;
import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class TripVersionService {
    private final TripVersionRepository tripVersionRepository;
    private final TripVersionSnapshotRepository tripVersionSnapshotRepository;
    private final TripAccessService tripAccessService;
    private final UserMapper userMapper;
    private final TripMapper tripMapper;
    private final ObjectMapper objectMapper;
    private final TripRepository tripRepository;

    @Transactional
    public CreateTripVersionResponse createVersion(Integer tripId, CreateTripVersionRequest request, User currentUser) {
        Trip trip = tripAccessService.getTripWithOwnerAccess(currentUser, tripId);
        String versionName = request.getVersionName().trim();

        int count = tripVersionRepository.countByTripId(tripId);
        if (count >= 3) {
            throw new BadRequestException("tripVersion.400.maxReached");
        }

        if (tripVersionRepository.existsByTripIdAndVersionName(tripId, versionName)) {
            throw new ConflictException("tripVersion.409.duplicate");
        }

        TripVersion tripVersion = new TripVersion();
        tripVersion.setTrip(trip);
        tripVersion.setVersionName(versionName);
        tripVersion.setSnapshotTripName(trip.getName());
        tripVersion.setSnapshotStartDate(trip.getStartDate());
        tripVersion.setSnapshotEndDate(trip.getEndDate());
        tripVersion.setCreatedBy(currentUser);
        tripVersion.setIsCurrent(false);

        TripVersion saved = tripVersionRepository.saveAndFlush(tripVersion);

        initializeSnapshotGraph(trip);
        TripOverviewDto tripOverview = tripMapper.tripToTripOverviewDto(trip);

        Map<String, Object> snapshot = objectMapper.convertValue(tripOverview, new TypeReference<>() {});

        TripVersionSnapshot tripVersionSnapshot = new TripVersionSnapshot();
        tripVersionSnapshot.setTripVersion(saved);
        tripVersionSnapshot.setSnapshotSchemaVersion((short) 1);
        tripVersionSnapshot.setSnapshot(snapshot);
        tripVersionSnapshotRepository.save(tripVersionSnapshot);

        PublicUserInfo createdBy = userMapper.userToPublicUserInfo(currentUser);

        return CreateTripVersionResponse.builder()
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

        if (Boolean.TRUE.equals(tripVersion.getIsCurrent())) {
            throw new BadRequestException("tripVersion.400.alreadyCurrent");
        }

        // Clear any existing current flag for this trip (single update statement)
        tripVersionRepository.clearCurrentForTrip(tripId);

        tripVersion.setIsCurrent(true);
        tripVersion.setAppliedAt(Instant.now());
        tripVersion.setAppliedBy(currentUser);

        lockedTrip.setName(tripVersion.getSnapshotTripName());
        lockedTrip.setStartDate(tripVersion.getSnapshotStartDate());
        lockedTrip.setEndDate(tripVersion.getSnapshotEndDate());
        tripRepository.save(lockedTrip);

        TripVersion saved = tripVersionRepository.saveAndFlush(tripVersion);

        Short snapshotSchemaVersion = tripVersionSnapshotRepository.findById(saved.getId())
                .map(TripVersionSnapshot::getSnapshotSchemaVersion)
                .orElse((short) 1);

        TripVersionDto dto = TripVersionDto.builder()
                .id(saved.getId())
                .tripId(saved.getTrip().getId())
                .versionName(saved.getVersionName())
                .createdAt(saved.getCreatedAt())
                .createdBy(saved.getCreatedBy() != null ? userMapper.userToPublicUserInfo(saved.getCreatedBy()) : null)
                .appliedAt(saved.getAppliedAt())
                .appliedBy(saved.getAppliedBy() != null ? userMapper.userToPublicUserInfo(saved.getAppliedBy()) : null)
                .isCurrent(saved.getIsCurrent())
                .snapshotSchemaVersion(snapshotSchemaVersion)
                .build();

        return ApplyTripVersionResponse.builder()
                .tripId(tripId)
                .appliedVersion(dto)
                .build();
    }

    @Transactional
    public List<TripVersionDto> listVersions(Integer tripId, Boolean includeSnapshot, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        List<TripVersionDto> results = new java.util.ArrayList<>();
        List<TripVersion> versions = tripVersionRepository.findAllByTripIdWithUsers(tripId);

        Map<Integer, TripVersionSnapshot> snapshotsByVersionId = new java.util.HashMap<>();

        if (Boolean.TRUE.equals(includeSnapshot)) {
            List<TripVersionSnapshot> snapshots = tripVersionSnapshotRepository.findAllByTripIdOrderByTripVersionCreatedAtDesc(tripId);
            for (TripVersionSnapshot s : snapshots) {
                snapshotsByVersionId.put(s.getTripVersion().getId(), s);
            }
        }

        for (TripVersion v : versions) {
            TripVersionDto.TripVersionDtoBuilder builder = TripVersionDto.builder()
                    .id(v.getId())
                    .tripId(v.getTrip().getId())
                    .versionName(v.getVersionName())
                    .createdAt(v.getCreatedAt())
                    .createdBy(v.getCreatedBy() != null ? userMapper.userToPublicUserInfo(v.getCreatedBy()) : null)
                    .appliedAt(v.getAppliedAt())
                    .appliedBy(v.getAppliedBy() != null ? userMapper.userToPublicUserInfo(v.getAppliedBy()) : null)
                    .isCurrent(v.getIsCurrent());

            if (Boolean.TRUE.equals(includeSnapshot)) {
                TripVersionSnapshot snap = snapshotsByVersionId.get(v.getId());
                if (snap != null) {
                    builder.snapshotSchemaVersion(snap.getSnapshotSchemaVersion());

                    try {
                        Map<String, Object> snapshotMap = snap.getSnapshot() == null
                                ? new HashMap<>()
                                : new HashMap<>(snap.getSnapshot());

                        if (isIncompleteSnapshot(snapshotMap)) {
                            Trip detailedTrip = tripAccessService.getTripWithTripmateLevelAccess(currentUser, tripId);
                            initializeSnapshotGraph(detailedTrip);
                            TripOverviewDto fallbackOverview = tripMapper.tripToTripOverviewDto(detailedTrip);
                            snapshotMap = objectMapper.convertValue(fallbackOverview, new TypeReference<>() {});
                        }

                        TripOverviewDto overview = objectMapper.convertValue(snapshotMap, TripOverviewDto.class);
                        builder.snapshot(overview);
                    } catch (Exception ex) {
                        throw new ServerErrorException("500");
                    }
                }
            }

            results.add(builder.build());
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

        if (Boolean.TRUE.equals(tripVersion.getIsCurrent())) {
            throw new BadRequestException("tripVersion.400.cannotDeleteCurrent");
        }

        tripVersionRepository.delete(tripVersion);
    }

    private boolean isIncompleteSnapshot(Map<String, Object> snapshotMap) {
        if (snapshotMap == null || snapshotMap.isEmpty()) {
            return true;
        }

        return !(snapshotMap.containsKey("id")
                && snapshotMap.containsKey("name")
                && snapshotMap.containsKey("owner")
                && snapshotMap.containsKey("objectives")
                && snapshotMap.containsKey("tripmates")
                && snapshotMap.containsKey("reservations")
                && snapshotMap.containsKey("wishlistPlaces")
                && snapshotMap.containsKey("dailyPlans")
                && snapshotMap.containsKey("checklist")
                && snapshotMap.containsKey("visibility"));
    }

    private void initializeSnapshotGraph(Trip trip) {
        Hibernate.initialize(trip.getOwner());

        Hibernate.initialize(trip.getObjectives());
        trip.getObjectives().forEach(objective -> Hibernate.initialize(objective.getBo()));

        Hibernate.initialize(trip.getTripmates());
        if (trip.getTripmates() != null) {
            trip.getTripmates().forEach(tripmate -> Hibernate.initialize(tripmate.getUser()));
        }

        Hibernate.initialize(trip.getReservations());

        Hibernate.initialize(trip.getWishlistPlaces());
        trip.getWishlistPlaces().forEach(wishlistPlace -> Hibernate.initialize(wishlistPlace.getPlace()));

        Hibernate.initialize(trip.getDailyPlans());
        trip.getDailyPlans().forEach(dailyPlan -> {
            Hibernate.initialize(dailyPlan.getScheduledPlaces());
            dailyPlan.getScheduledPlaces().forEach(scheduledPlace -> Hibernate.initialize(scheduledPlace.getGgmp()));
        });

        Hibernate.initialize(trip.getChecklists());
    }
}