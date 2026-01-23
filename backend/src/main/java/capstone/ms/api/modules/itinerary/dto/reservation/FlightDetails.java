package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class FlightDetails implements ReservationDetails {
    @NotBlank
    private String airline;

    @NotBlank
    private String flightNo;

    private String boardingTime;

    private String gateNo;

    @NotBlank
    private String departureAirport;

    @NotBlank
    private String departureTime;

    @NotBlank
    private String arrivalAirport;

    @NotBlank
    private String arrivalTime;

    private String flightClass;

    private List<FlightPassenger> passengers;

    @Override
    public String getType() {
        return "FLIGHT";
    }
}
