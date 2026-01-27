package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.FlightPassengerId;
import capstone.ms.api.modules.itinerary.entities.reservation.FlightPassengerReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightPassengerReservationRepository extends JpaRepository<FlightPassengerReservation, FlightPassengerId> {
}
