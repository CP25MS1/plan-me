package capstone.ms.api.modules.itinerary.dto.travel_segment;

import lombok.Data;

@Data
public class TravelSegmentResponseDto {
    private String startPlaceId;
    private String endPlaceId;
    private String mode;
    private Integer distance;
    private Integer regularDuration;
}
