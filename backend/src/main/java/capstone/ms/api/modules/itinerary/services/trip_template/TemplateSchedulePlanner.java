package capstone.ms.api.modules.itinerary.services.trip_template;

import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ScheduledPlaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TemplateSchedulePlanner {

    private final ScheduledPlaceMapper scheduledPlaceMapper;

    public List<ScheduledPlace> copyScheduledPlaces(Trip template, Trip createdTrip, List<DailyPlan> createdPlans) {
        List<ScheduledPlace> result = new ArrayList<>();

        if (template.getDailyPlans() == null || template.getDailyPlans().isEmpty()) {
            return result;
        }

        Map<LocalDate, DailyPlan> newPlanByDate = createdPlans.stream()
                .filter(p -> p.getDate() != null)
                .collect(Collectors.toMap(
                        DailyPlan::getDate,
                        p -> p,
                        (a, b) -> a
                ));

        LocalDate templateBase = template.getStartDate();

        if (templateBase == null) {
            templateBase = template.getDailyPlans()
                    .stream()
                    .map(DailyPlan::getDate)
                    .filter(Objects::nonNull)
                    .min(LocalDate::compareTo)
                    .orElse(null);
        }

        List<DailyPlan> orderedTemplatePlans = template.getDailyPlans()
                .stream()
                .sorted(Comparator.comparing(
                        DailyPlan::getDate,
                        Comparator.nullsLast(LocalDate::compareTo)
                ))
                .toList();

        int index = 0;

        for (DailyPlan templatePlan : orderedTemplatePlans) {
            long offset;

            if (templateBase != null && templatePlan.getDate() != null) {
                offset = ChronoUnit.DAYS.between(templateBase, templatePlan.getDate());
            } else {
                offset = index;
            }

            LocalDate targetDate = null;

            if (createdTrip.getStartDate() != null) {
                targetDate = createdTrip.getStartDate().plusDays(offset);
            }

            DailyPlan targetPlan =
                    targetDate != null ? newPlanByDate.get(targetDate) : null;

            if (targetPlan == null || templatePlan.getScheduledPlaces() == null) {
                index++;
                continue;
            }

            List<ScheduledPlace> sortedPlaces =
                    templatePlan.getScheduledPlaces()
                            .stream()
                            .sorted(Comparator.comparing(
                                    ScheduledPlace::getOrder,
                                    Comparator.nullsLast(Comparator.naturalOrder())
                            ))
                            .toList();

            for (ScheduledPlace sp : sortedPlaces) {
                ScheduledPlace clone = scheduledPlaceMapper.cloneToNew(sp, targetPlan);
                if (clone != null) {
                    result.add(clone);
                }
            }

            index++;
        }

        return result;
    }
}
