package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistPlaceRepository extends JpaRepository<WishlistPlace, Integer> {
    boolean existsByTripAndPlace(Trip trip, GoogleMapPlace place);

    Optional<WishlistPlace> findByIdAndTripId(Integer placeId, Integer tripId);
}
