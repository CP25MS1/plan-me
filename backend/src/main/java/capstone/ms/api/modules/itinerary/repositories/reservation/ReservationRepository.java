package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.reservation.Reservation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByTrip(Trip trip);

    @Modifying
    @Query("delete from Reservation r where r.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);

    @EntityGraph(attributePaths = {
            "lodgingReservation",
            "restaurantReservation",
            "flightReservation",
            "flightReservation.passengers",
            "trainReservation",
            "busReservation",
            "ferryReservation",
            "carRentalReservation"
    })
    @Query("select r from Reservation r where r.trip.id = :tripId")
    List<Reservation> findAllWithDetailsByTripId(@Param("tripId") Integer tripId);
}
