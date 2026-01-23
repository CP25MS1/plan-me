package capstone.ms.api.modules.google_maps.dto;

import lombok.Data;

@Data
public class GoogleMapPlaceDto {
    private String ggmpId;
    private Short rating;

    private String thName;
    private String thDescription;
    private String thAddress;

    private String enName;
    private String enDescription;
    private String enAddress;

    private String openingHours;
    private String defaultPicUrl;
}

