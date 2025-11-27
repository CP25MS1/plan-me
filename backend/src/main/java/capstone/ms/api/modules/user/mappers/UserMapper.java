package capstone.ms.api.modules.user.mappers;

import capstone.ms.api.modules.user.dto.GoogleClaimsDto;
import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.user.entities.Preference;
import capstone.ms.api.modules.user.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "registered", ignore = true)
    @Mapping(target = "followers", source = "followers")
    @Mapping(target = "following", source = "following")
    @Mapping(target = "preference", source = "preference")
    UserDto userToUserDto(User user);

    User userDtoToUser(UserDto dto);

    PreferenceDto preferenceToPreferenceDto(Preference preference);
    Preference preferenceDtoToPreference(PreferenceDto dto);

    PublicUserInfo userToPublicUserInfo(User user);

    Set<PublicUserInfo> usersToPublicUserInfoSet(Set<User> users);

    @Mapping(target = "registered", ignore = true)
    @Mapping(target = "idp", constant = "GG")
    @Mapping(target = "idpId", source = "idpId")
    @Mapping(target = "username", source = "name")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "profilePicUrl", source = "picture")
    UserDto googleClaimsToUserDto(GoogleClaimsDto claims);
}
