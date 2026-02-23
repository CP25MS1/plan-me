package capstone.ms.api.modules.itinerary.dto.memory;

import capstone.ms.api.modules.itinerary.entities.memory.TripMemoryType;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripMemoryDto {
    private Integer id;
    private Integer albumId;
    private Integer tripId;
    private PublicUserInfo uploader;
    private String originalFilename;
    private String fileExtension;
    private String contentType;
    private TripMemoryType memoryType;
    private Long sizeBytes;
    private Instant createdAt;
    private String signedUrl;
    private Instant signedUrlExpiresAt;
}
