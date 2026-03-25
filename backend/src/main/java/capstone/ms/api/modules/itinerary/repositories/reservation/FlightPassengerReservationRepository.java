package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.FlightPassengerId;
import capstone.ms.api.modules.itinerary.entities.reservation.FlightPassengerReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FlightPassengerReservationRepository extends JpaRepository<FlightPassengerReservation, FlightPassengerId> {
    @Modifying
    @Query("delete from FlightPassengerReservation fp where fp.flightReservation.reservation.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
