package capstone.ms.api.modules.itinerary.dto.reservation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationPreviewRequest {
    private Integer emailId;
    private String type;
}
