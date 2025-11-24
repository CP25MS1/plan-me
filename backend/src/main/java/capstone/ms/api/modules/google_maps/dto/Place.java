package capstone.ms.api.modules.google_maps.dto;

import lombok.Data;

import java.util.List;

@Data
public class Place {
    private String id;
    private LocalizedText displayName;
    private LocalizedText editorialSummary;
    private String formattedAddress;
    private Double rating;
    private OpeningHours regularOpeningHours;
    private List<Photo> photos;
}
