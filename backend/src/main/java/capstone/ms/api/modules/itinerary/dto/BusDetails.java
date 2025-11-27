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
public class BusDetails implements ReservationDetails {
    @NotBlank
    private String transportCompany;

    @NotBlank
    private String departureStation;

    @NotNull
    private LocalDateTime departureTime;

    @NotBlank
    private String arrivalStation;

    private String busClass;

    @NotBlank
    @Size(max = 80)
    private String passengerName;

    @NotBlank
    private String seatNo;

    @Override
    public String getType() {
        return "BUS";
    }
}
