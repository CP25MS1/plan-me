package capstone.ms.api.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private boolean registered;
    private Integer userId;
    @NotNull(message = "Username cannot be null")
    private String username;
    @NotNull(message = "Email cannot be null")
    private String email;
    @NotNull(message = "IDP cannot be null")
    private String idp;
    @NotNull(message = "IDP ID cannot be null")
    private String idpId;
    @NotNull(message = "Profile picture URL cannot be null")
    private String profilePicUrl;
    private Preference preference;
    private List<Object> followers;
    private List<Object> followings;

    @Builder
    @Data
    public static class Preference {
        private String language;
    }
}
