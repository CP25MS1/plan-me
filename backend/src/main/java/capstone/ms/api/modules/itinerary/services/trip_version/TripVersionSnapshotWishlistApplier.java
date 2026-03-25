package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.dto.WishlistPlaceDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import capstone.ms.api.modules.itinerary.repositories.WishlistPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotWishlistApplier {
    private final WishlistPlaceRepository wishlistPlaceRepository;

    public void apply(
            Integer tripId,
            Trip trip,
            Set<WishlistPlaceDto> snapshotWishlistPlaces,
            Map<String, GoogleMapPlace> placesByGgmpId
    ) {
        wishlistPlaceRepository.deleteAllByTripId(tripId);

        if (snapshotWishlistPlaces == null || snapshotWishlistPlaces.isEmpty()) {
            return;
        }

        Map<String, WishlistPlace> uniqueByGgmpId = new LinkedHashMap<>();

        for (WishlistPlaceDto wp : snapshotWishlistPlaces) {
            if (wp != null && wp.getPlace() != null && wp.getPlace().getGgmpId() != null) {
                String ggmpId = wp.getPlace().getGgmpId().trim();
                if (!ggmpId.isBlank() && !uniqueByGgmpId.containsKey(ggmpId)) {
                    GoogleMapPlace place = placesByGgmpId.get(ggmpId);
                    if (place == null) {
                        throw new NotFoundException("place.404");
                    }

                    WishlistPlace entity = new WishlistPlace();
                    entity.setTrip(trip);
                    entity.setPlace(place);
                    entity.setNotes(wp.getNotes());
                    uniqueByGgmpId.put(ggmpId, entity);
                }
            }
        }

        if (!uniqueByGgmpId.isEmpty()) {
            wishlistPlaceRepository.saveAll(uniqueByGgmpId.values());
        }
    }
}

