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
public class TrainDetails implements ReservationDetails {
    @NotBlank
    private String trainNo;

    @NotBlank
    private String trainClass;

    @NotBlank
    private String seatClass;

    @NotBlank
    private String seatNo;

    @NotBlank
    @Size(max = 80)
    private String passengerName;

    @NotBlank
    private String departureStation;

    @NotNull
    private LocalDateTime departureTime;

    @NotBlank
    private String arrivalStation;

    @NotNull
    private LocalDateTime arrivalTime;

    @Override
    public String getType() {
        return "TRAIN";
    }
}
