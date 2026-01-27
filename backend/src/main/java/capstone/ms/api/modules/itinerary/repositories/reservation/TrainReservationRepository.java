package capstone.ms.api.modules.itinerary.repositories.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.TrainReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainReservationRepository extends JpaRepository<TrainReservation, Integer> {
}
