package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.FlightReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightReservationRepository extends JpaRepository<FlightReservation, Integer> {

}
