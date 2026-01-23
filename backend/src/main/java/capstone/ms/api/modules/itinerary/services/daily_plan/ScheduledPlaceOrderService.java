package capstone.ms.api.modules.itinerary.services.daily_plan;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.repositories.ScheduledPlaceRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ScheduledPlaceOrderService {
    private final ScheduledPlaceRepository scheduledPlaceRepository;

    @Transactional
    public ScheduledPlace moveAndReorder(ScheduledPlace sp, DailyPlan targetPlan, short requestedOrder) {
        if (sp == null || targetPlan == null)
            throw new NotFoundException("400");

        Integer sourceTripId = sp.getPlan().getTrip().getId();
        Integer targetTripId = targetPlan.getTrip().getId();
        if (!sourceTripId.equals(targetTripId)) {
            throw new ConflictException("dailyPlan.scheduledPlace.nonRelatedTrip");
        }

        Integer sourcePlanId = sp.getPlan().getId();
        Integer targetPlanId = targetPlan.getId();

        short oldOrder = sp.getOrder();
        short targetMax = scheduledPlaceRepository.findMaxOrderByPlanId(targetPlanId);
        validateAndNormalizeOrder(
                sourcePlanId.equals(targetPlanId),
                requestedOrder,
                targetMax
        );

        // same plan
        if (sourcePlanId.equals(targetPlanId)) {
            if (requestedOrder == oldOrder) return sp;

            if (requestedOrder > oldOrder) {
                scheduledPlaceRepository.decrementOrdersBetween(
                        sourcePlanId,
                        (short) (oldOrder + 1),
                        requestedOrder
                );
            } else {
                scheduledPlaceRepository.incrementOrdersBetween(
                        sourcePlanId,
                        requestedOrder,
                        (short) (oldOrder - 1)
                );
            }

            sp.setOrder(requestedOrder);
            return scheduledPlaceRepository.save(sp);
        }

        // different plan (same trip)
        scheduledPlaceRepository.decrementOrdersGreaterThan(sourcePlanId, oldOrder);
        scheduledPlaceRepository.incrementOrdersGreaterOrEqual(targetPlanId, requestedOrder);

        sp.setPlan(targetPlan);
        sp.setOrder(requestedOrder);
        return scheduledPlaceRepository.save(sp);
    }

    @Transactional
    public void removeAndReorder(ScheduledPlace sp) {
        if (sp == null) return;
        Integer planId = sp.getPlan().getId();
        Short oldOrder = sp.getOrder();
        scheduledPlaceRepository.delete(sp);
        scheduledPlaceRepository.decrementOrdersGreaterThan(planId, oldOrder);
    }

    private void validateAndNormalizeOrder(
            boolean samePlan,
            short requestedOrder,
            short targetMax
    ) {
        if (requestedOrder < 1)
            throw new BadRequestException("dailyPlan.scheduledPlace.invalidOrder");

        if (samePlan && requestedOrder > targetMax) {
            throw new ConflictException("dailyPlan.scheduledPlace.outOfRangeOrder");
        }

        // different plan
        if (requestedOrder > targetMax + 1)
            throw new ConflictException("dailyPlan.scheduledPlace.outOfRangeOrder");
    }

}
