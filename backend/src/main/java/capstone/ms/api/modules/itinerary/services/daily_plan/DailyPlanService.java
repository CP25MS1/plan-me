package capstone.ms.api.modules.itinerary.services.daily_plan;

import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.modules.itinerary.dto.daily_plan.CreateScheduledPlaceRequest;
import capstone.ms.api.modules.itinerary.dto.daily_plan.ScheduledPlaceDto;
import capstone.ms.api.modules.itinerary.dto.daily_plan.UpdateScheduledPlaceRequest;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.mappers.ScheduledPlaceMapper;
import capstone.ms.api.modules.itinerary.repositories.DailyPlanRepository;
import capstone.ms.api.modules.itinerary.repositories.ScheduledPlaceRepository;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.itinerary.services.TripResourceService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class DailyPlanService {

    private final TripAccessService tripAccessService;
    private final TripResourceService tripResourceService;
    private final DailyPlanColorService dailyPlanColorService;
    private final ScheduledPlaceOrderService scheduledPlaceOrderService;

    private final DailyPlanRepository dailyPlanRepository;
    private final ScheduledPlaceRepository scheduledPlaceRepository;
    private final ScheduledPlaceMapper scheduledPlaceMapper;

    @Transactional
    public void syncDailyPlansByTripDateRange(
            Integer tripId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        var trip = tripResourceService.getTripOrThrow(tripId);

        Map<LocalDate, DailyPlan> existingPlansByDate =
                dailyPlanRepository.findAllByTripId(tripId).stream()
                        .collect(Collectors.toMap(DailyPlan::getDate, Function.identity()));

        if (startDate == null) return;

        LocalDate effectiveEndDate = (endDate != null) ? endDate : startDate;

        Set<LocalDate> targetDates = startDate
                .datesUntil(effectiveEndDate.plusDays(1))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<DailyPlan> plansToCreate = new ArrayList<>();
        List<DailyPlan> plansToDelete = new ArrayList<>();

        int dayIndex = 0;

        for (LocalDate date : targetDates) {
            if (existingPlansByDate.containsKey(date)) {
                dayIndex++;
                continue;
            }

            plansToCreate.add(
                    DailyPlan.builder()
                            .trip(trip)
                            .date(date)
                            .pinColor(dailyPlanColorService.resolvePinColor(dayIndex))
                            .build()
            );
            dayIndex++;
        }

        for (DailyPlan plan : existingPlansByDate.values()) {
            if (!targetDates.contains(plan.getDate())) {
                plansToDelete.add(plan);
            }
        }

        if (!plansToDelete.isEmpty()) {
            dailyPlanRepository.deleteAllInBatch(plansToDelete);
        }

        if (!plansToCreate.isEmpty()) {
            dailyPlanRepository.saveAll(plansToCreate);
        }
    }

    @Transactional
    public ScheduledPlaceDto createScheduledPlace(
            User currentUser,
            Integer tripId,
            CreateScheduledPlaceRequest request
    ) {
        checkTripAccess(currentUser, tripId);

        var dailyPlan = tripResourceService.getDailyPlanOrThrow(request.getPlanId());
        var googleMapPlace = tripResourceService.getGoogleMapPlaceOrThrow(request.getGgmpId());

        ScheduledPlace scheduledPlace = new ScheduledPlace();
        scheduledPlace.setPlan(dailyPlan);
        scheduledPlace.setGgmp(googleMapPlace);
        scheduledPlace.setNotes(request.getNotes());
        scheduledPlace.setOrder(getScheduledPlaceNextOrder(request.getPlanId()));

        return scheduledPlaceMapper.toDto(
                scheduledPlaceRepository.save(scheduledPlace)
        );
    }

    @Transactional
    public ScheduledPlaceDto updateScheduledPlace(
            User currentUser,
            Integer tripId,
            Integer placeId,
            UpdateScheduledPlaceRequest request
    ) {
        checkTripAccess(currentUser, tripId);

        var targetPlan = tripResourceService.getDailyPlanOrThrow(request.getPlanId());
        var scheduledPlace = tripResourceService.getScheduledPlaceOrThrow(placeId);

        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            scheduledPlace.setNotes(request.getNotes());
        }

        return scheduledPlaceMapper.toDto(
                scheduledPlaceOrderService.moveAndReorder(
                        scheduledPlace,
                        targetPlan,
                        request.getOrder()
                )
        );
    }

    @Transactional
    public void deleteScheduledPlace(
            User currentUser,
            Integer tripId,
            Integer placeId
    ) {
        checkTripAccess(currentUser, tripId);

        ScheduledPlace scheduledPlace =
                tripResourceService.getScheduledPlaceOrThrow(placeId);

        scheduledPlaceOrderService.removeAndReorder(scheduledPlace);
    }

    private void checkTripAccess(User user, Integer tripId) {
        tripResourceService.getTripOrThrow(tripId);
        tripAccessService.assertTripmateLevelAccess(user, tripId);
    }

    private Short getScheduledPlaceNextOrder(Integer planId) {
        Short maxOrder = scheduledPlaceRepository.findMaxOrderByPlanId(planId);
        return (short) (maxOrder + 1);
    }
}

