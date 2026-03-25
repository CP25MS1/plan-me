package capstone.ms.api.modules.itinerary.dto.trip_version;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BaseTripVersionDto {
    private Integer id;
    private Integer tripId;
    private String versionName;
    private Instant createdAt;
    private PublicUserInfo createdBy;
    private Instant appliedAt;
    private PublicUserInfo appliedBy;
    private Boolean isCurrent;
    private Short snapshotSchemaVersion;
}
