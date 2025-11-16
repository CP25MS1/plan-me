package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistPlaceRepository extends JpaRepository<WishlistPlace, Integer> {
    boolean existsByTripAndPlace(Trip trip, GoogleMapPlace place);
}
