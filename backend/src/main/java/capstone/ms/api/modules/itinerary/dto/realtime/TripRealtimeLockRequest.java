package capstone.ms.api.modules.itinerary.dto.realtime;

import jakarta.validation.constraints.NotNull;

public record TripRealtimeLockRequest(
        @NotNull TripRealtimeResourceType resourceType,
        @NotNull Integer resourceId,
        Integer planId,
        @NotNull TripRealtimeLockPurpose purpose
) {
}

