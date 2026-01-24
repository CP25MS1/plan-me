package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class FlightDetails implements ReservationDetails {
    @NotBlank
    @Size(max = 20)
    private String airline;

    @NotBlank
    @Size(max = 6)
    private String flightNo;

    private String boardingTime;

    @Size(max = 4)
    private String gateNo;

    @NotBlank
    private String departureAirport;

    private String departureTime;

    @NotBlank
    private String arrivalAirport;

    private String arrivalTime;

    @Size(max = 10)
    private String flightClass;

    private List<FlightPassenger> passengers;

    @Override
    public String getType() {
        return "FLIGHT";
    }
}
