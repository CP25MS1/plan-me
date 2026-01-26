package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.reservation.RestaurantReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantReservationRepository extends JpaRepository<RestaurantReservation, Integer> {
}
