package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

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

    @NotNull
    private LocalDateTime checkinDate;

    @NotNull
    private LocalDateTime checkoutDate;

    @Override
    public String getType() {
        return "LODGING";
    }
}
