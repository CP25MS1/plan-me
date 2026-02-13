package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

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

    @NotNull
    private LocalDateTime pickupTime;

    @NotBlank
    private String dropoffLocation;

    @NotNull
    private LocalDateTime dropoffTime;

    @Override
    public String getType() {
        return "CAR_RENTAL";
    }
}
