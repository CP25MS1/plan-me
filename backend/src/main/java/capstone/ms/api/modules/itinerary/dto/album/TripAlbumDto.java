package capstone.ms.api.modules.itinerary.dto.album;

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
public class TripAlbumDto {
    private Integer albumId;
    private Integer tripId;
    private String name;
    private PublicUserInfo createdBy;
    private Instant createdAt;
}
