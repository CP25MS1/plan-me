package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.tripmate.PendingTripmateDto;
import capstone.ms.api.modules.itinerary.dto.tripmate.TripmateDto;
import capstone.ms.api.modules.itinerary.entities.tripmate.PendingTripmateInvitation;
import capstone.ms.api.modules.itinerary.entities.tripmate.Tripmate;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TripmateMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.profilePicUrl", target = "profilePicUrl")
    TripmateDto toTripmateDto(Tripmate tripmate);

    @Mapping(source = "id", target = "invitationId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.profilePicUrl", target = "profilePicUrl")
    PendingTripmateDto toPendingTripmateDto(PendingTripmateInvitation invitation);
}
