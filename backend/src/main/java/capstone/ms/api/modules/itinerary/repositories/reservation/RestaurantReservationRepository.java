package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.RestaurantReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RestaurantReservationRepository extends JpaRepository<RestaurantReservation, Integer> {
    @Modifying
    @Query("delete from RestaurantReservation rr where rr.reservation.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
