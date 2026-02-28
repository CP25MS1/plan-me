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
public class TripAlbumSignedUrlItemDto {
    private Integer memoryId;
    private String originalFilename;
    private String fileExtension;
    private String signedUrl;
    private Instant signedUrlExpiresAt;
}
