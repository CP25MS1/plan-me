package capstone.ms.api.modules.itinerary.dto.daily_plan;

import capstone.ms.api.modules.google_maps.dto.GoogleMapPlaceDto;
import lombok.Data;

@Data
public class ScheduledPlaceDto {
    private Integer placeId;
    private Integer tripId;
    private Integer planId;
    private String notes;
    private Short order;
    private GoogleMapPlaceDto placeDetail;
}
