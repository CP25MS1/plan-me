package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.repositories.DailyPlanRepository;
import capstone.ms.api.modules.itinerary.repositories.ScheduledPlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotDailyPlansApplier {
    private final DailyPlanRepository dailyPlanRepository;
    private final ScheduledPlaceRepository scheduledPlaceRepository;

    public void apply(
            Integer tripId,
            Trip trip,
            Set<DailyPlan> snapshotDailyPlans,
            Map<String, GoogleMapPlace> placesByGgmpId
    ) {
        scheduledPlaceRepository.deleteAllByTripId(tripId);
        dailyPlanRepository.deleteAllByTripId(tripId);

        if (snapshotDailyPlans == null || snapshotDailyPlans.isEmpty()) {
            return;
        }

        List<DailyPlan> sourcePlans = snapshotDailyPlans.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(DailyPlan::getDate, Comparator.nullsLast(LocalDate::compareTo)))
                .toList();

        Map<LocalDate, DailyPlan> planByDate = buildPlansByDate(trip, sourcePlans);
        if (planByDate.isEmpty()) {
            return;
        }

        Map<LocalDate, DailyPlan> createdByDate = persistPlansByDate(planByDate);

        List<ScheduledPlace> placesToCreate = buildScheduledPlaces(sourcePlans, createdByDate, placesByGgmpId);
        if (!placesToCreate.isEmpty()) {
            scheduledPlaceRepository.saveAll(placesToCreate);
        }
    }

    private Map<LocalDate, DailyPlan> buildPlansByDate(Trip trip, List<DailyPlan> sourcePlans) {
        Map<LocalDate, DailyPlan> planByDate = new LinkedHashMap<>();

        for (DailyPlan source : sourcePlans) {
            LocalDate date = source.getDate();
            if (date != null && !planByDate.containsKey(date)) {
                String pinColor = source.getPinColor();
                if (pinColor == null || pinColor.isBlank()) {
                    throw new ServerErrorException("500");
                }

                DailyPlan plan = new DailyPlan();
                plan.setTrip(trip);
                plan.setDate(date);
                plan.setPinColor(pinColor);
                planByDate.put(date, plan);
            }
        }

        return planByDate;
    }

    private Map<LocalDate, DailyPlan> persistPlansByDate(Map<LocalDate, DailyPlan> planByDate) {
        List<DailyPlan> createdPlans = dailyPlanRepository.saveAll(planByDate.values());

        Map<LocalDate, DailyPlan> createdByDate = new HashMap<>();
        for (DailyPlan plan : createdPlans) {
            if (plan.getDate() != null) {
                createdByDate.put(plan.getDate(), plan);
            }
        }
        return createdByDate;
    }

    private List<ScheduledPlace> buildScheduledPlaces(
            List<DailyPlan> sourcePlans,
            Map<LocalDate, DailyPlan> createdByDate,
            Map<String, GoogleMapPlace> placesByGgmpId
    ) {
        List<ScheduledPlace> placesToCreate = new ArrayList<>();

        for (DailyPlan sourcePlan : sourcePlans) {
            LocalDate date = sourcePlan.getDate();
            DailyPlan targetPlan = date != null ? createdByDate.get(date) : null;
            if (targetPlan != null && sourcePlan.getScheduledPlaces() != null) {
                List<ScheduledPlace> orderedPlaces = sourcePlan.getScheduledPlaces().stream()
                        .filter(Objects::nonNull)
                        .sorted(Comparator.comparing(ScheduledPlace::getOrder, Comparator.nullsLast(Short::compareTo)))
                        .toList();

                for (ScheduledPlace sourcePlace : orderedPlaces) {
                    placesToCreate.add(mapScheduledPlaceOrThrow(targetPlan, sourcePlace, placesByGgmpId));
                }
            }
        }

        return placesToCreate;
    }

    private ScheduledPlace mapScheduledPlaceOrThrow(
            DailyPlan targetPlan,
            ScheduledPlace sourcePlace,
            Map<String, GoogleMapPlace> placesByGgmpId
    ) {
        if (sourcePlace.getOrder() == null) {
            throw new ServerErrorException("500");
        }

        ScheduledPlace place = new ScheduledPlace();
        place.setPlan(targetPlan);
        place.setOrder(sourcePlace.getOrder());
        place.setNotes(sourcePlace.getNotes());

        GoogleMapPlace sourceGgmp = sourcePlace.getGgmp();
        String ggmpId = sourceGgmp != null ? sourceGgmp.getGgmpId() : null;
        if (ggmpId != null && !ggmpId.isBlank()) {
            GoogleMapPlace referencedPlace = placesByGgmpId.get(ggmpId);
            if (referencedPlace == null) {
                throw new NotFoundException("place.404");
            }
            place.setGgmp(referencedPlace);
        }

        return place;
    }
}
