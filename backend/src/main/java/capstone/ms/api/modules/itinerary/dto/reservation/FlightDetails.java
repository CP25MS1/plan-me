package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class FlightDetails implements ReservationDetails {
    @NotBlank
    private String airline;

    @NotBlank
    private String flightNo;

    private LocalDateTime boardingTime;

    private String gateNo;

    @NotBlank
    private String departureAirport;

    @NotNull
    private LocalDateTime departureTime;

    @NotBlank
    private String arrivalAirport;

    @NotNull
    private LocalDateTime arrivalTime;

    private String flightClass;

    private List<FlightPassenger> passengers;

    @Override
    public String getType() {
        return "FLIGHT";
    }
}
