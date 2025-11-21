package capstone.ms.api.modules.google_maps.dto;

import lombok.Data;

@Data
public class TextSearchRequest {
    private String textQuery;
    private String languageCode;
    private Integer pageSize;
    private String pageToken;
}
