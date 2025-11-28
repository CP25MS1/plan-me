package capstone.ms.api.modules.itinerary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationPreviewResult<T extends ReservationDetails> {
    private Integer emailId;
    private String type;
    private T parsed;
    private boolean valid;
}
