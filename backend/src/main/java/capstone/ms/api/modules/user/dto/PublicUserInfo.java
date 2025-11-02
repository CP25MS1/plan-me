package capstone.ms.api.modules.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicUserInfo {
    private final Integer id;
    private final String username;
    private final String email;
    private final String profilePicUrl;
}
