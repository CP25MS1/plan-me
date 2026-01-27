package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.LodgingReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LodgingReservationRepository extends JpaRepository<LodgingReservation, Integer> {

}
