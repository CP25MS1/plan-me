package capstone.ms.api.modules.itinerary.dto.tripmate;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class InviteTripResponseDto {
    private Integer tripId;
    private String status;
    private List<InviteInfo> invites;
}
