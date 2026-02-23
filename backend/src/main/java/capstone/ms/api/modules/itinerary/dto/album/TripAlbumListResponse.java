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
public class TripAlbumListResponse {
    private List<TripAlbumListItemDto> items;
    private String nextCursor;
}
