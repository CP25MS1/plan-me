package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class FlightPassenger {
    @NotBlank
    @Size(max = 80)
    private String passengerName;

    @NotBlank
    @Size(max = 4)
    private String seatNo;
}
