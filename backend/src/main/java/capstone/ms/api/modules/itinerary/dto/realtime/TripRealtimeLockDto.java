package capstone.ms.api.modules.itinerary.dto.realtime;

import java.time.Instant;

public record TripRealtimeLockDto(
        Integer tripId,
        TripRealtimeSection section,
        TripRealtimeResourceType resourceType,
        Integer resourceId,
        Integer planId,
        TripRealtimeLockPurpose purpose,
        TripRealtimeUserDto owner,
        Instant acquiredAt,
        Instant expiresAt
) {
}

