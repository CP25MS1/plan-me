package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class LodgingDetails implements ReservationDetails {
    @NotBlank
    @Size(max = 80)
    private String lodgingName;

    @NotBlank
    private String lodgingAddress;

    @NotBlank
    @Size(max = 80)
    private String underName;

    private String checkinDate;

    private String checkoutDate;

    @Override
    public String getType() {
        return "LODGING";
    }
}
