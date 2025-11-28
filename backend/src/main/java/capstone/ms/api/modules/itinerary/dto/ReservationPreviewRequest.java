package capstone.ms.api.modules.itinerary.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ReservationPreviewRequest {
    private Integer emailId;
    private String type;
}
