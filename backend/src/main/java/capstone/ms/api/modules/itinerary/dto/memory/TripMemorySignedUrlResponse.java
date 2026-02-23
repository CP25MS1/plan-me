package capstone.ms.api.modules.itinerary.dto.memory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripMemorySignedUrlResponse {
    private Integer memoryId;
    private String signedUrl;
    private Instant signedUrlExpiresAt;
}
