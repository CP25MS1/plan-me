package capstone.ms.api.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicUserInfo {
    private Integer id;
    private String username;
    private String email;
    private String profilePicUrl;
}
