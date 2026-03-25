package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.FerryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FerryReservationRepository extends JpaRepository<FerryReservation, Integer> {
    @Modifying
    @Query("delete from FerryReservation fr where fr.reservation.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
