package capstone.ms.api.modules.itinerary.dto.tripmate;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class InviteActionResponseDto {
    private Integer tripId;
    private Integer invitationId;
    private String status;
}
