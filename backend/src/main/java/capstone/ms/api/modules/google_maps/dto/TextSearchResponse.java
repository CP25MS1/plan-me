package capstone.ms.api.modules.google_maps.dto;

import lombok.Data;

import java.util.List;

@Data
public class TextSearchResponse {
    private List<Place> places;
    private String nextPageToken;
    private String searchUri;
}
