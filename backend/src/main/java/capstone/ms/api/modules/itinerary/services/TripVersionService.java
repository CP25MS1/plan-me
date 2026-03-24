package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionRequest;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionResponse;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripVersion;
import capstone.ms.api.modules.itinerary.entities.TripVersionSnapshot;
import capstone.ms.api.modules.itinerary.repositories.TripVersionRepository;
import capstone.ms.api.modules.itinerary.repositories.TripVersionSnapshotRepository;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.mappers.UserMapper;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class TripVersionService {
    private final TripVersionRepository tripVersionRepository;
    private final TripVersionSnapshotRepository tripVersionSnapshotRepository;
    private final TripAccessService tripAccessService;
    private final UserMapper userMapper;

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

        // clear existing current BEFORE inserting the new one
        tripVersionRepository.clearCurrentForTrip(tripId);
        tripVersionRepository.flush();

        TripVersion tripVersion = new TripVersion();
        tripVersion.setTrip(trip);
        tripVersion.setVersionName(versionName);
        tripVersion.setSnapshotTripName(trip.getName());
        tripVersion.setSnapshotStartDate(trip.getStartDate());
        tripVersion.setSnapshotEndDate(trip.getEndDate());
        tripVersion.setCreatedBy(currentUser);
        tripVersion.setIsCurrent(true);
        tripVersion.setCreatedAt(Instant.now());

        TripVersion saved = tripVersionRepository.saveAndFlush(tripVersion);

        Map<String, Object> snapshot = buildSnapshot(trip);

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

    private Map<String, Object> buildSnapshot(Trip trip) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("trip", buildTripInfo(trip));
        snapshot.put("booking", Map.of());
        snapshot.put("places", buildPlaces(trip));
        snapshot.put("dailyPlans", buildDailyPlans(trip));
        return snapshot;
    }

    private Map<String, Object> buildTripInfo(Trip trip) {
        Map<String, Object> tripInfo = new LinkedHashMap<>();
        tripInfo.put("id", trip.getId());
        tripInfo.put("name", trip.getName());
        tripInfo.put("startDate", trip.getStartDate());
        tripInfo.put("endDate", trip.getEndDate());
        return tripInfo;
    }

    private List<Map<String, Object>> buildPlaces(Trip trip) {
        if (trip.getWishlistPlaces() == null) return List.of();

        return trip.getWishlistPlaces()
                .stream()
                .map(wp -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", wp.getId());
                    item.put("ggmpId", wp.getPlace() != null ? wp.getPlace().getGgmpId() : null);
                    item.put("notes", wp.getNotes());
                    return item;
                })
                .toList();
    }

    private List<Map<String, Object>> buildDailyPlans(Trip trip) {
        if (trip.getDailyPlans() == null) return List.of();

        return trip.getDailyPlans()
                .stream()
                .map(dp -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", dp.getId());
                    item.put("date", dp.getDate());
                    item.put("scheduledPlaces", dp.getScheduledPlaces() != null
                            ? dp.getScheduledPlaces().stream()
                            .map(sp -> {
                                Map<String, Object> spItem = new LinkedHashMap<>();
                                spItem.put("id", sp.getId());
                                spItem.put("ggmpId", sp.getGgmp() != null ? sp.getGgmp().getGgmpId() : null);
                                spItem.put("order", sp.getOrder());
                                return spItem;
                            })
                            .toList()
                            : List.of());
                    return item;
                })
                .toList();
    }
}