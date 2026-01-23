package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class CarRentalDetails implements ReservationDetails {
    @NotBlank
    private String rentalCompany;

    @NotBlank
    private String carModel;

    @NotBlank
    private String vrn;

    @NotBlank
    private String renterName;

    @NotBlank
    private String pickupLocation;

    @NotBlank
    private String pickupTime;

    @NotBlank
    private String dropoffLocation;

    @NotBlank
    private String dropoffTime;

    @Override
    public String getType() {
        return "CAR_RENTAL";
    }
}
