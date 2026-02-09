package capstone.ms.api.modules.itinerary.dto.tripmate;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PendingInvitationDto {
    private Integer invitationId;
    private Integer tripId;
    private PublicUserInfo inviter;
}
