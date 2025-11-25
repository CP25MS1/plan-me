package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.CarRentalReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRentalReservationRepository extends JpaRepository<CarRentalReservation, Integer> {
}
