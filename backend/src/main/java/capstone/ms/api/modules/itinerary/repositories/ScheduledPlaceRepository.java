package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ScheduledPlaceRepository extends JpaRepository<ScheduledPlace, Integer> {

    @Query("""
                select coalesce(max(sp.order), 0)
                from ScheduledPlace sp
                where sp.plan.id = :planId
            """)
    Short findMaxOrderByPlanId(@Param("planId") Integer planId);

    @Modifying
    @Query("update ScheduledPlace sp set sp.order = sp.order - 1 where sp.plan.id = :planId and sp.order > :fromOrder")
    int decrementOrdersGreaterThan(@Param("planId") Integer planId, @Param("fromOrder") Short fromOrder);

    @Modifying
    @Query("update ScheduledPlace sp set sp.order = sp.order + 1 where sp.plan.id = :planId and sp.order >= :fromOrder")
    int incrementOrdersGreaterOrEqual(@Param("planId") Integer planId, @Param("fromOrder") Short fromOrder);

    @Modifying
    @Query("update ScheduledPlace sp set sp.order = sp.order + 1 where sp.plan.id = :planId and sp.order between :startOrder and :endOrder")
    int incrementOrdersBetween(@Param("planId") Integer planId, @Param("startOrder") Short startOrder, @Param("endOrder") Short endOrder);

    @Modifying
    @Query("update ScheduledPlace sp set sp.order = sp.order - 1 where sp.plan.id = :planId and sp.order between :startOrder and :endOrder")
    int decrementOrdersBetween(@Param("planId") Integer planId, @Param("startOrder") Short startOrder, @Param("endOrder") Short endOrder);
}