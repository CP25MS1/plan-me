package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.itinerary.dto.TripTemplateDetailDto;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import org.mapstruct.Mapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.IntStream;

@Mapper(componentModel = "spring", uses = {PlaceMapper.class, ObjectiveMapper.class})
public abstract class TripTemplateMapper {
    protected final PlaceMapper placeMapper;
    protected final ObjectiveMapper objectiveMapper;

    protected TripTemplateMapper(PlaceMapper placeMapper, ObjectiveMapper objectiveMapper) {
        this.placeMapper = placeMapper;
        this.objectiveMapper = objectiveMapper;
    }

    public TripTemplateDetailDto toDetailDto(Trip trip, List<TripTemplateDetailDto.ChecklistItem> checklistItems) {
        var wishlist = trip.getWishlistPlaces() == null
                ? List.<TripTemplateDetailDto.WishlistPlace>of()
                : trip.getWishlistPlaces().stream()
                .map(wp -> TripTemplateDetailDto.WishlistPlace.builder()
                        .placeId(wp.getId())
                        .place(placeMapper.toGoogleMapPlaceDto(wp.getPlace()))
                        .build())
                .toList();

        List<DailyPlan> plans = trip.getDailyPlans() == null
                ? List.of()
                : trip.getDailyPlans().stream()
                .sorted(Comparator.comparing(DailyPlan::getDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        LocalDate start = trip.getStartDate();

        var dailyPlans = IntStream.range(0, plans.size())
                .mapToObj(i -> {
                    DailyPlan p = plans.get(i);

                    int dayIndex = (start != null && p.getDate() != null)
                            ? (int) (ChronoUnit.DAYS.between(start, p.getDate()) + 1)
                            : i + 1;

                    var scheduledPlaces = p.getScheduledPlaces() == null
                            ? List.<TripTemplateDetailDto.ScheduledPlace>of()
                            : p.getScheduledPlaces().stream()
                            .sorted(Comparator.comparing(ScheduledPlace::getOrder, Comparator.nullsLast(Short::compareTo)))
                            .map(sp -> TripTemplateDetailDto.ScheduledPlace.builder()
                                    .order(sp.getOrder())
                                    .place(placeMapper.toGoogleMapPlaceDto(sp.getGgmp()))
                                    .build())
                            .toList();

                    return TripTemplateDetailDto.DailyPlan.builder()
                            .dayIndex(dayIndex)
                            .scheduledPlaces(scheduledPlaces)
                            .build();
                })
                .toList();

        return TripTemplateDetailDto.builder()
                .templateTripId(trip.getId())
                .tripName(trip.getName())
                .objectives(objectiveMapper.toTemplateList(trip.getObjectives()))
                .wishlistPlaces(wishlist)
                .dailyPlans(dailyPlans)
                .checklistItems(checklistItems == null ? List.of() : checklistItems)
                .build();
    }
}
