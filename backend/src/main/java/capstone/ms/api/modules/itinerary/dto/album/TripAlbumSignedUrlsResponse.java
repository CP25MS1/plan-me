package capstone.ms.api.modules.itinerary.dto.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripAlbumSignedUrlsResponse {
    private Integer albumId;
    private Integer tripId;
    private String albumName;
    private Integer totalItems;
    private List<TripAlbumSignedUrlItemDto> items;
}
