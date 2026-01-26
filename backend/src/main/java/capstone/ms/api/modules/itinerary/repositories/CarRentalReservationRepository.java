package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.reservation.CarRentalReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRentalReservationRepository extends JpaRepository<CarRentalReservation, Integer> {
}
