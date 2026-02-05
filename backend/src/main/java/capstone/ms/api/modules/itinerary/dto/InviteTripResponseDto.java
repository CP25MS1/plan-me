package capstone.ms.api.modules.itinerary.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class InviteTripResponseDto {
    private Integer tripId;
    private List<Integer> invitedIds;
}
