package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class FerryDetails implements ReservationDetails {
    @NotBlank
    private String transportCompany;

    @NotBlank
    @Size(max = 80)
    private String passengerName;

    @NotBlank
    private String departurePort;

    @NotNull
    private LocalDateTime departureTime;

    @NotBlank
    private String arrivalPort;

    @NotNull
    private LocalDateTime arrivalTime;

    @NotBlank
    private String ticketType;

    @Override
    public String getType() {
        return "FERRY";
    }
}
