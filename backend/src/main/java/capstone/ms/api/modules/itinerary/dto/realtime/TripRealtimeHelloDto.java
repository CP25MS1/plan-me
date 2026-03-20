package capstone.ms.api.modules.itinerary.dto.realtime;

import java.time.Instant;

public record TripRealtimeHelloDto(
        Instant serverTime,
        String connectionId,
        TripRealtimeUserDto user
) {
}

