package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class RestaurantDetails implements ReservationDetails {
    @NotBlank
    @Size(max = 80)
    private String restaurantName;

    @NotBlank
    private String restaurantAddress;

    @NotBlank
    @Size(max = 80)
    private String underName;

    private String reservationDate;

    private LocalTime reservationTime;

    private String tableNo;
    private String queueNo;

    @Min(1)
    private Integer partySize;

    @Override
    public String getType() {
        return "RESTAURANT";
    }
}
