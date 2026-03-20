package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistPlaceRepository extends JpaRepository<WishlistPlace, Integer> {
    boolean existsByTripAndPlace(Trip trip, GoogleMapPlace place);

    Optional<WishlistPlace> findByIdAndTripId(Integer placeId, Integer tripId);

    @Query("select wp from WishlistPlace wp join fetch wp.place where wp.trip.id = :tripId")
    List<WishlistPlace> findAllWithPlaceByTripId(@Param("tripId") Integer tripId);
}
