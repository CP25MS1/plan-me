package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import capstone.ms.api.modules.user.mappers.UserMapper;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.user.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ChecklistMapper {

    @Mapping(target = "tripId", source = "trip.id")
    TripChecklistDto toDto(TripChecklist checklist);

    default TripChecklist cloneToNew(TripChecklist source, Trip targetTrip, User createdBy) {
        if (source == null) return null;
        TripChecklist copy = new TripChecklist();
        copy.setTrip(targetTrip);
        copy.setCreatedBy(createdBy);
        copy.setName(source.getName());
        copy.setCompleted(false);
        return copy;
    }
}
