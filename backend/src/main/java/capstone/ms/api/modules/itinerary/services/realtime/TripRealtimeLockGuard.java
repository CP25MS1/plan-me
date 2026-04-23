package capstone.ms.api.modules.itinerary.services.realtime;

import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.TripRealtimeLockConflictException;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeLockDto;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeResourceType;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;

@Service
@AllArgsConstructor
public class TripRealtimeLockGuard {
    private final TripRealtimeHub hub;

    public void assertTripMutationAllowed(Integer tripId, User currentUser) {
        Instant now = Instant.now();
        TripRealtimeLockDto lock = hub.getActiveLock(tripId, TripRealtimeResourceType.TRIP, tripId, now).orElse(null);
        if (lock == null) {
            return;
        }
        if (Objects.equals(lock.owner().id(), currentUser.getId())) {
            return;
        }
        throw new TripRealtimeLockConflictException(lock);
    }

    public void assertLockHeld(Integer tripId, TripRealtimeResourceType resourceType, Integer resourceId, User currentUser) {
        Instant now = Instant.now();
        TripRealtimeLockDto lock = hub.getActiveLock(tripId, resourceType, resourceId, now).orElse(null);
        if (lock == null) {
            throw new ConflictException("realtime.lock.409.notHeld");
        }
        if (!Objects.equals(lock.owner().id(), currentUser.getId())) {
            throw new TripRealtimeLockConflictException(lock);
        }
    }
}
