package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.modules.google_maps.dto.GoogleMapPlaceDto;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TripTemplateDetailDto {
    private Integer templateTripId;
    private String tripName;
    private List<TemplateObjectiveDto> objectives;
    private List<WishlistPlace> wishlistPlaces;
    private List<DailyPlan> dailyPlans;
    private List<ChecklistItem> checklistItems;

    @Data
    @Builder
    public static class WishlistPlace {
        private Integer placeId;
        private GoogleMapPlaceDto place;
    }

    @Data
    @Builder
    public static class DailyPlan {
        private Integer dayIndex;
        private List<ScheduledPlace> scheduledPlaces;
    }

    @Data
    @Builder
    public static class ScheduledPlace {
        private Short order;
        private GoogleMapPlaceDto place;
    }

    @Data
    @Builder
    public static class ChecklistItem {
        private String name;
    }
}
