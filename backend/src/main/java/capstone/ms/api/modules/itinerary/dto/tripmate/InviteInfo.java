package capstone.ms.api.modules.itinerary.dto.tripmate;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class InviteInfo {
    private Integer invitationId;
    private Integer userId;
}
