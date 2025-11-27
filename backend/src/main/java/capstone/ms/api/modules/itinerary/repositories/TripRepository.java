package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Integer> {
}