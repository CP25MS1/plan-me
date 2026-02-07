package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import capstone.ms.api.modules.user.mappers.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ChecklistMapper {

    TripChecklistDto toDto(TripChecklist checklist);
}
