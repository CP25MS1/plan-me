package capstone.ms.api.modules.itinerary.dto.travel_segment;

import capstone.ms.api.modules.itinerary.entities.TravelSegmentMode;
import lombok.Data;

@Data
public class RouteGoogleResultDto {
    private Integer distanceMeters;
    private Integer durationSeconds;
    private TravelSegmentMode mode;
}
