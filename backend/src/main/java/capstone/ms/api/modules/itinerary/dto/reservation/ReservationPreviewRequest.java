package capstone.ms.api.modules.itinerary.dto.reservation;

import capstone.ms.api.modules.itinerary.entities.reservation.ReservationType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationPreviewRequest {
    @NotNull
    private Integer emailId;

    @NotNull
    private ReservationType type;
}
