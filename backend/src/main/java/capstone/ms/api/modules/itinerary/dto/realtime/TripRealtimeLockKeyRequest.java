package capstone.ms.api.modules.itinerary.dto.realtime;

import jakarta.validation.constraints.NotNull;

public record TripRealtimeLockKeyRequest(
        @NotNull TripRealtimeResourceType resourceType,
        @NotNull Integer resourceId
) {
}

