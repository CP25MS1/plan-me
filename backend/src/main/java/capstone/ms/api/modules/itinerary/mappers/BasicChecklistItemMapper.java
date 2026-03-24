package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.checklist.RecommendedChecklistItemDto;
import capstone.ms.api.modules.itinerary.entities.BasicChecklistItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BasicChecklistItemMapper {
    RecommendedChecklistItemDto toDto(BasicChecklistItem entity);
}

