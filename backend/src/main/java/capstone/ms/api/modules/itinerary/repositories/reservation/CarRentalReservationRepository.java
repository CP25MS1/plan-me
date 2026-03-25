package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.CarRentalReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CarRentalReservationRepository extends JpaRepository<CarRentalReservation, Integer> {
    @Modifying
    @Query("delete from CarRentalReservation crr where crr.reservation.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
