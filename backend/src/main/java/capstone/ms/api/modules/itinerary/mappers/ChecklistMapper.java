package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import capstone.ms.api.modules.user.mappers.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ChecklistMapper {

    @Mapping(target = "tripId", source = "trip.id")
    TripChecklistDto toDto(TripChecklist checklist);
}
