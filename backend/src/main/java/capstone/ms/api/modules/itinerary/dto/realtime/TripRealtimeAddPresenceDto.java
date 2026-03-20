package capstone.ms.api.modules.itinerary.dto.realtime;

import java.time.Instant;

public record TripRealtimeAddPresenceDto(
        Integer tripId,
        TripRealtimeSection section,
        Integer planId,
        TripRealtimeUserDto user,
        Instant updatedAt
) {
}

