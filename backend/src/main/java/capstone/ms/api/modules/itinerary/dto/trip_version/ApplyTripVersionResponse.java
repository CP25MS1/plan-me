package capstone.ms.api.modules.itinerary.dto.trip_version;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplyTripVersionResponse {
    private Integer tripId;
    private TripVersionDto appliedVersion;
}

