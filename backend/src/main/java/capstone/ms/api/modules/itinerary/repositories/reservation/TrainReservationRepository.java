package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.TrainReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrainReservationRepository extends JpaRepository<TrainReservation, Integer> {
    @Modifying
    @Query("delete from TrainReservation tr where tr.reservation.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
