package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class BusDetails implements ReservationDetails {
    @NotBlank
    private String transportCompany;

    @NotBlank
    private String departureStation;

    @NotBlank
    private String departureTime;

    @NotBlank
    private String arrivalStation;

    private String busClass;

    @NotBlank
    private String passengerName;

    @NotBlank
    private String seatNo;

    @Override
    public String getType() {
        return "BUS";
    }
}
