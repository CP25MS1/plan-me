package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripChecklistRepository extends JpaRepository<TripChecklist, Integer> {
    List<TripChecklist> findAllByTripId(Integer tripId);
}