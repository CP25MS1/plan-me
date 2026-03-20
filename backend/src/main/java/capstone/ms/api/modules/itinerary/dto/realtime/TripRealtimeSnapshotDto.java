package capstone.ms.api.modules.itinerary.dto.realtime;

import java.util.List;

public record TripRealtimeSnapshotDto(
        List<TripRealtimeLockDto> locks,
        List<TripRealtimeAddPresenceDto> addPresence
) {
}

