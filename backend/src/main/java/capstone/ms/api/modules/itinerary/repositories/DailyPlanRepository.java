package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DailyPlanRepository extends JpaRepository<DailyPlan, Integer> {
    List<DailyPlan> findAllByTripId(Integer tripId);
}