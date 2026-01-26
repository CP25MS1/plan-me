package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.reservation.FerryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FerryReservationRepository extends JpaRepository<FerryReservation, Integer> {
}
