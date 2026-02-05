package capstone.ms.api.modules.itinerary.dto.tripmate;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AcceptInviteDto {
    private Integer tripId;
    private Integer invitationId;
    private String status;
}
