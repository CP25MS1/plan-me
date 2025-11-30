package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

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

    private String departureTime;

    @NotBlank
    private String arrivalPort;

    private String arrivalTime;

    @NotBlank
    private String ticketType;

    @Override
    public String getType() {
        return "FERRY";
    }
}
