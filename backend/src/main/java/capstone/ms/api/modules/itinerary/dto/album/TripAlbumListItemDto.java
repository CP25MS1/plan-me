package capstone.ms.api.modules.itinerary.dto.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripAlbumListItemDto {
    private Integer albumId;
    private Integer tripId;
    private String tripName;
    private String albumName;
    private Long memoryCount;
    private Long totalSizeBytes;
    private Instant createdAt;
}
