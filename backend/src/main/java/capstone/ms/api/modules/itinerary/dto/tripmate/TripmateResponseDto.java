package capstone.ms.api.modules.itinerary.dto.tripmate;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class TripmateResponseDto {
    private Integer tripId;
    private List<TripmateDto> joined;
    private List<PendingTripmateDto> pending;
}
