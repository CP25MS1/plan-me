package capstone.ms.api.modules.itinerary.dto.realtime;

import java.time.Instant;
import java.util.List;

public record TripRealtimeDataChangedDto(
        Integer tripId,
        List<TripRealtimeScope> scopes,
        Instant at,
        Integer initiatorUserId
) {
}

