package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.NotificationDto;
import capstone.ms.api.modules.itinerary.entities.Notification;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "actorUser", target = "actor", qualifiedByName = "userToPublicUserInfo")
    @Mapping(source = "trip.id", target = "tripId")
    NotificationDto toNotificationDto(Notification notification);

    @Named("userToPublicUserInfo")
    default PublicUserInfo mapUserToPublicUserInfo(User user) {
        if (user == null) return null;
        return PublicUserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePicUrl(user.getProfilePicUrl())
                .build();
    }
}
