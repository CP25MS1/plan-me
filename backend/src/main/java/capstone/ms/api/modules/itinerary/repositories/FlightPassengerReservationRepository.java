package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.FlightPassengerId;
import capstone.ms.api.modules.itinerary.entities.FlightPassengerReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightPassengerReservationRepository extends JpaRepository<FlightPassengerReservation, FlightPassengerId> {
}
