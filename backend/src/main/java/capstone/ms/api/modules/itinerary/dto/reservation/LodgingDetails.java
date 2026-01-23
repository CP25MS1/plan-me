package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class LodgingDetails implements ReservationDetails {
    @NotBlank
    private String lodgingName;

    @NotBlank
    private String lodgingAddress;

    @NotBlank
    private String underName;

    private String checkinDate;

    private String checkoutDate;

    @Override
    public String getType() {
        return "LODGING";
    }
}
