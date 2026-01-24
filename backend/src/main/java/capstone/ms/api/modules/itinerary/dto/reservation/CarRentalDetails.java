package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(max = 10)
    private String vrn;

    @NotBlank
    @Size(max = 80)
    private String renterName;

    @NotBlank
    private String pickupLocation;

    private String pickupTime;

    @NotBlank
    private String dropoffLocation;

    private String dropoffTime;

    @Override
    public String getType() {
        return "CAR_RENTAL";
    }
}
