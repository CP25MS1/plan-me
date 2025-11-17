package capstone.ms.api.modules.itinerary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WishlistPlaceDto {
    private Integer id;
    private Integer tripId;
    private String notes;
    private PlaceInfo place;

    @Data
    @Builder
    public static class PlaceInfo {
        private String ggmpId;
        private int rating;
        private LocalizedInfo TH;
        private LocalizedInfo EN;
        private String opening_hours;
        private String defaultPicUrl;
    }

    @Data
    @Builder
    public static class LocalizedInfo {
        private String name;
        private String description;
        private String address;
    }
}
