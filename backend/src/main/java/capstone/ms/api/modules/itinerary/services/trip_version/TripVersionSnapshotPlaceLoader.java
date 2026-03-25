package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.google_maps.repositories.GoogleMapPlaceRepository;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.dto.WishlistPlaceDto;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotPlaceLoader {
    private final GoogleMapPlaceRepository googleMapPlaceRepository;

    public Map<String, GoogleMapPlace> loadPlacesByGgmpId(TripOverviewDto snapshotOverview) {
        Set<String> referencedGgmpIds = referencedGgmpIds(snapshotOverview);
        if (referencedGgmpIds.isEmpty()) {
            return Map.of();
        }

        List<GoogleMapPlace> places = googleMapPlaceRepository.findAllById(referencedGgmpIds);
        Map<String, GoogleMapPlace> byId = new HashMap<>();
        for (GoogleMapPlace place : places) {
            if (place != null && place.getGgmpId() != null) {
                byId.put(place.getGgmpId(), place);
            }
        }
        return byId;
    }

    private Set<String> referencedGgmpIds(TripOverviewDto snapshotOverview) {
        if (snapshotOverview == null) {
            return Set.of();
        }

        Stream<String> wishlistIds = Optional.ofNullable(snapshotOverview.getWishlistPlaces())
                .stream()
                .flatMap(Set::stream)
                .filter(Objects::nonNull)
                .map(WishlistPlaceDto::getPlace)
                .filter(Objects::nonNull)
                .map(WishlistPlaceDto.PlaceInfo::getGgmpId);

        Stream<String> dailyPlanIds = Optional.ofNullable(snapshotOverview.getDailyPlans())
                .stream()
                .flatMap(Set::stream)
                .filter(Objects::nonNull)
                .map(DailyPlan::getScheduledPlaces)
                .filter(Objects::nonNull)
                .flatMap(Set::stream)
                .filter(Objects::nonNull)
                .map(ScheduledPlace::getGgmp)
                .filter(Objects::nonNull)
                .map(GoogleMapPlace::getGgmpId);

        return Stream.concat(wishlistIds, dailyPlanIds)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toCollection(HashSet::new));
    }
}

