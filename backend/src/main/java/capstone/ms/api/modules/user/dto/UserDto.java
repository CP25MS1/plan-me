package capstone.ms.api.modules.user.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@ErrorMessage(messageKey = "user.400.create")
public class UserDto {
    private Boolean registered;
    private Integer userId;
    @NotNull(message = "username cannot be null")
    @Size(max = 80, message = "username cannot exceed 80 characters")
    private String username;
    @NotNull(message = "email cannot be null")
    @Size(max = 80, message = "email cannot exceed 80 characters")
    private String email;
    @NotNull(message = "idp cannot be null")
    @Size(min = 2, max = 2, message = "idp must be exactly 2 characters")
    private String idp;
    @NotNull(message = "idpId cannot be null")
    private String idpId;
    @NotNull(message = "profilePicUrl cannot be null")
    private String profilePicUrl;
    private PreferenceDto preference;
    private Set<PublicUserInfo> followers;
    private Set<PublicUserInfo> following;
}
