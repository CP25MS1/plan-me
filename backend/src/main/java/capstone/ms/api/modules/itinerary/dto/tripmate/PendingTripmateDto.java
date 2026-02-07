package capstone.ms.api.modules.itinerary.dto.tripmate;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PendingTripmateDto {
    private Integer invitationId;
    private Integer userId;
    private String username;
    private String email;
    private String profilePicUrl;
}
