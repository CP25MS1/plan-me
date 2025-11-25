package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@ErrorMessage(messageKey = "reservation.400")
public class ReservationDto {
    private Integer id;

    @NotNull
    private Integer tripId;

    private String ggmpId;

    @NotBlank
    @Pattern(regexp = "LODGING|RESTAURANT|FLIGHT|TRAIN|BUS|FERRY|CAR_RENTAL")
    private String type;

    private String bookingRef;

    @Size(max = 10)
    private String contactTel;

    @Email
    @Size(max = 80)
    private String contactEmail;

    @DecimalMin("0.0")
    private BigDecimal cost;

    @Valid
    @NotNull
    private ReservationDetails details;
}
