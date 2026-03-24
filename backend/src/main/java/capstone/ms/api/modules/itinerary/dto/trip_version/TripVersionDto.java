package capstone.ms.api.modules.itinerary.dto.trip_version;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripVersionDto {
    private Integer id;
    private Integer tripId;
    private String versionName;
    private Instant createdAt;
    private PublicUserInfo createdBy;
    private Instant appliedAt;
    private PublicUserInfo appliedBy;
    private Boolean isCurrent;
    private Short snapshotSchemaVersion;
    private TripOverviewDto snapshot;
}

