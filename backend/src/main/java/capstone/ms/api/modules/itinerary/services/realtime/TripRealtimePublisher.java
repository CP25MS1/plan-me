package capstone.ms.api.modules.itinerary.services.realtime;

import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeScope;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.*;

@Component
@RequiredArgsConstructor
public class TripRealtimePublisher {
    private static final Object TX_RESOURCE_KEY = new Object();

    private final TripRealtimeHub hub;

    private record PendingChange(EnumSet<TripRealtimeScope> scopes, Integer initiatorUserId) {}

    public void publishDataChangedAfterCommit(Integer tripId, Collection<TripRealtimeScope> scopes) {
        publishDataChangedAfterCommit(tripId, scopes, null);
    }

    public void publishDataChangedAfterCommit(Integer tripId, Collection<TripRealtimeScope> scopes, Integer initiatorUserId) {
        if (scopes == null || scopes.isEmpty()) return;

        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            hub.broadcastDataChanged(tripId, scopes, Instant.now(), initiatorUserId);
            return;
        }

        @SuppressWarnings("unchecked")
        Map<Integer, PendingChange> pending =
                (Map<Integer, PendingChange>) TransactionSynchronizationManager.getResource(TX_RESOURCE_KEY);

        if (pending == null) {
            pending = new HashMap<>();
            TransactionSynchronizationManager.bindResource(TX_RESOURCE_KEY, pending);

            Map<Integer, PendingChange> captured = pending;
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    Instant at = Instant.now();
                    captured.forEach((tid, pc) -> hub.broadcastDataChanged(tid, pc.scopes, at, pc.initiatorUserId));
                }

                @Override
                public void afterCompletion(int status) {
                    TransactionSynchronizationManager.unbindResourceIfPossible(TX_RESOURCE_KEY);
                }
            });
        }

        PendingChange pc = pending.get(tripId);
        EnumSet<TripRealtimeScope> currentScopes;
        Integer currentInitiator = initiatorUserId;

        if (pc == null) {
            currentScopes = EnumSet.noneOf(TripRealtimeScope.class);
        } else {
            currentScopes = pc.scopes;
            // If we already had an initiator, keep it (assuming it's the same for the whole tx)
            if (pc.initiatorUserId != null) {
                currentInitiator = pc.initiatorUserId;
            }
        }
        currentScopes.addAll(scopes);
        pending.put(tripId, new PendingChange(currentScopes, currentInitiator));
    }
}

