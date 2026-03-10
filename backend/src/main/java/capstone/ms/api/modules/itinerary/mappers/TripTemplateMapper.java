package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.itinerary.dto.TripTemplateDetailDto;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class TripTemplateMapper {
    private final PlaceMapper placeMapper;
    private final ObjectiveMapper objectiveMapper;

    public TripTemplateMapper(PlaceMapper placeMapper, ObjectiveMapper objectiveMapper) {
        this.placeMapper = placeMapper;
        this.objectiveMapper = objectiveMapper;
    }

    public TripTemplateDetailDto toDetailDto(Trip trip, List<TripTemplateDetailDto.ChecklistItem> checklistItems) {
        TripTemplateDetailDto.TripTemplateDetailDtoBuilder builder = TripTemplateDetailDto.builder()
                .templateTripId(trip.getId())
                .tripName(trip.getName())
                .objectives(objectiveMapper.toTemplateList(trip.getObjectives()));

        var wishlist = trip.getWishlistPlaces() == null ? List.<TripTemplateDetailDto.WishlistPlace>of() : trip.getWishlistPlaces().stream()
                .map(wp -> TripTemplateDetailDto.WishlistPlace.builder()
                        .placeId(wp.getId())
                        .place(placeMapper.toGoogleMapPlaceDto(wp.getPlace()))
                        .build())
                .toList();
        builder.wishlistPlaces(wishlist);

        List<TripTemplateDetailDto.DailyPlan> dailyPlans = new ArrayList<>();
        List<DailyPlan> plans = trip.getDailyPlans() == null ? List.of() : trip.getDailyPlans().stream()
                .sorted(Comparator.comparing(DailyPlan::getDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        if (!plans.isEmpty()) {
            LocalDate start = trip.getStartDate();
            for (int i = 0; i < plans.size(); i++) {
                DailyPlan p = plans.get(i);
                int dayIndex = (start != null && p.getDate() != null) ? (int) (ChronoUnit.DAYS.between(start, p.getDate()) + 1) : i + 1;

                List<ScheduledPlace> spList = p.getScheduledPlaces() == null ? new ArrayList<>() : new ArrayList<>(p.getScheduledPlaces());
                spList.sort(Comparator.comparing(ScheduledPlace::getOrder, Comparator.nullsLast(Short::compareTo)));

                List<TripTemplateDetailDto.ScheduledPlace> sched = spList.stream().map(sp -> TripTemplateDetailDto.ScheduledPlace.builder()
                                .order(sp.getOrder())
                                .place(placeMapper.toGoogleMapPlaceDto(sp.getGgmp()))
                                .build())
                        .toList();

                dailyPlans.add(TripTemplateDetailDto.DailyPlan.builder()
                        .dayIndex(dayIndex)
                        .scheduledPlaces(sched)
                        .build());
            }
        }
        builder.dailyPlans(dailyPlans);
        builder.checklistItems(checklistItems == null ? List.of() : checklistItems);

        return builder.build();
    }
}
