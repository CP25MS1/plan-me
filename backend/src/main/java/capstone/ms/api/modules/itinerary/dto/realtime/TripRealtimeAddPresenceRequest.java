package capstone.ms.api.modules.itinerary.dto.realtime;

import jakarta.validation.constraints.NotNull;

public record TripRealtimeAddPresenceRequest(
        @NotNull TripRealtimeSection section,
        Integer planId
) {
}

