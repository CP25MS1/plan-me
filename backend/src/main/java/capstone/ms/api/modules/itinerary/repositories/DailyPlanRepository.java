package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DailyPlanRepository extends JpaRepository<DailyPlan, Integer> {
    List<DailyPlan> findAllByTripId(Integer tripId);

    @Query("""
            select distinct dp
            from DailyPlan dp
            left join fetch dp.scheduledPlaces sp
            left join fetch sp.ggmp
            where dp.trip.id = :tripId
            """)
    List<DailyPlan> findAllWithScheduledPlacesByTripId(@Param("tripId") Integer tripId);
}
