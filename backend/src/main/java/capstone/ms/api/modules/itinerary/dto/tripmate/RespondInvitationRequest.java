package capstone.ms.api.modules.itinerary.dto.tripmate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RespondInvitationRequest {
    @NotNull
    private String status;
    @NotNull
    private String invitationCode;
}
