package capstone.ms.api.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private boolean registered;
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
    private Preference preference;
    private List<Object> followers;
    private List<Object> followings;

    @Builder
    @Data
    public static class Preference {
        private String language;
    }
}
