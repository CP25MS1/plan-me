package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.tripmate.PendingTripmateDto;
import capstone.ms.api.modules.itinerary.dto.tripmate.TripmateDto;
import capstone.ms.api.modules.itinerary.entities.tripmate.PendingTripmateInvitation;
import capstone.ms.api.modules.itinerary.entities.tripmate.Tripmate;
import capstone.ms.api.modules.user.mappers.UserMapper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface TripmateMapper {

    @Mapping(source = "user", target = "user")
    TripmateDto toTripmateDto(Tripmate tripmate);

    @Mapping(source = "id", target = "invitationId")
    @Mapping(source = "user", target = "user")
    PendingTripmateDto toPendingTripmateDto(PendingTripmateInvitation invitation);
}
