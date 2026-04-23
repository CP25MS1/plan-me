package capstone.ms.api.modules.itinerary.services.daily_plan;

import capstone.ms.api.common.exceptions.ConflictException;
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
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeResourceType;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeScope;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimeLockGuard;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimePublisher;
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
    private final TripRealtimeLockGuard tripRealtimeLockGuard;
    private final TripRealtimePublisher tripRealtimePublisher;

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

        if (startDate == null) {
            if (!existingPlansByDate.isEmpty()) {
                dailyPlanRepository.deleteAllInBatch(existingPlansByDate.values());
            }
            return;
        }

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
        tripRealtimeLockGuard.assertTripMutationAllowed(tripId, currentUser);

        var dailyPlan = tripResourceService.getDailyPlanOrThrow(request.getPlanId());
        var googleMapPlace = tripResourceService.getGoogleMapPlaceOrThrow(request.getGgmpId());

        ScheduledPlace scheduledPlace = new ScheduledPlace();
        scheduledPlace.setPlan(dailyPlan);
        scheduledPlace.setGgmp(googleMapPlace);
        scheduledPlace.setNotes(request.getNotes());
        scheduledPlace.setOrder(getScheduledPlaceNextOrder(request.getPlanId()));

        ScheduledPlace saved = scheduledPlaceRepository.save(scheduledPlace);
        tripRealtimePublisher.publishDataChangedAfterCommit(tripId, List.of(TripRealtimeScope.DAILY_PLANS));

        return scheduledPlaceMapper.toDto(saved);
    }

    @Transactional
    public ScheduledPlaceDto updateScheduledPlace(
            User currentUser,
            Integer tripId,
            Integer placeId,
            UpdateScheduledPlaceRequest request
    ) {
        checkTripAccess(currentUser, tripId);
        tripRealtimeLockGuard.assertTripMutationAllowed(tripId, currentUser);

        var trip = tripResourceService.getTripOrThrow(tripId);
        var targetPlan = tripResourceService.getDailyPlanOrThrow(request.getPlanId());
        var scheduledPlace = tripResourceService.getScheduledPlaceOrThrow(placeId);

        if (!trip.getId().equals(scheduledPlace.getPlan().getTrip().getId())) {
            throw new ConflictException("dailyPlan.scheduledPlace.nonRelatedTrip");
        }

        tripRealtimeLockGuard.assertLockHeld(tripId, TripRealtimeResourceType.SCHEDULED_PLACE, placeId, currentUser);

        if (!trip.getId().equals(targetPlan.getTrip().getId())) {
            throw new ConflictException("dailyPlan.scheduledPlace.nonRelatedTrip");
        }

        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            scheduledPlace.setNotes(request.getNotes());
        }

        ScheduledPlace result = scheduledPlaceOrderService.moveAndReorder(
                scheduledPlace,
                targetPlan,
                request.getOrder()
        );

        tripRealtimePublisher.publishDataChangedAfterCommit(tripId, List.of(TripRealtimeScope.DAILY_PLANS));

        return scheduledPlaceMapper.toDto(result);
    }

    @Transactional
    public void deleteScheduledPlace(
            User currentUser,
            Integer tripId,
            Integer placeId
    ) {
        checkTripAccess(currentUser, tripId);
        tripRealtimeLockGuard.assertTripMutationAllowed(tripId, currentUser);

        ScheduledPlace scheduledPlace =
                tripResourceService.getScheduledPlaceOrThrow(placeId);

        if (!tripId.equals(scheduledPlace.getPlan().getTrip().getId())) {
            throw new ConflictException("dailyPlan.scheduledPlace.nonRelatedTrip");
        }

        tripRealtimeLockGuard.assertLockHeld(tripId, TripRealtimeResourceType.SCHEDULED_PLACE, placeId, currentUser);

        scheduledPlaceOrderService.removeAndReorder(scheduledPlace);

        tripRealtimePublisher.publishDataChangedAfterCommit(tripId, List.of(TripRealtimeScope.DAILY_PLANS));
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
