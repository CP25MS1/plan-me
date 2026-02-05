package capstone.ms.api.modules.itinerary.dto.tripmate;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class InviteTripRequestDto {
    @NotEmpty
    private List<Integer> receiverIds;
}
