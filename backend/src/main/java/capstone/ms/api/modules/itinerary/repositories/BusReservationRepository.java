package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.reservation.BusReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusReservationRepository extends JpaRepository<BusReservation, Integer> {
}
