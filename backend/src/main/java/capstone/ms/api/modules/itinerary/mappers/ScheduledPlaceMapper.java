package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.itinerary.dto.daily_plan.ScheduledPlaceDto;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = PlaceMapper.class)
public interface ScheduledPlaceMapper {

    @Mapping(target = "placeId", source = "id")
    @Mapping(target = "planId", source = "plan.id")
    @Mapping(target = "tripId", source = "plan.trip.id")
    @Mapping(target = "placeDetail", source = "ggmp")
    ScheduledPlaceDto toDto(ScheduledPlace entity);

    List<ScheduledPlaceDto> toDtoList(List<ScheduledPlace> entities);

    default ScheduledPlace cloneToNew(ScheduledPlace source, DailyPlan newPlan) {
        if (source == null) return null;
        ScheduledPlace p = new ScheduledPlace();
        p.setPlan(newPlan);
        p.setGgmp(source.getGgmp());
        p.setNotes(null);
        p.setOrder(source.getOrder());
        return p;
    }
}
