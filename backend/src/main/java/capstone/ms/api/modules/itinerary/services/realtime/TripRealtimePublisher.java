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

    public void publishDataChangedAfterCommit(Integer tripId, Collection<TripRealtimeScope> scopes) {
        if (scopes == null || scopes.isEmpty()) return;

        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            hub.broadcastDataChanged(tripId, scopes, Instant.now());
            return;
        }

        @SuppressWarnings("unchecked")
        Map<Integer, EnumSet<TripRealtimeScope>> pending =
                (Map<Integer, EnumSet<TripRealtimeScope>>) TransactionSynchronizationManager.getResource(TX_RESOURCE_KEY);

        if (pending == null) {
            pending = new HashMap<>();
            TransactionSynchronizationManager.bindResource(TX_RESOURCE_KEY, pending);

            Map<Integer, EnumSet<TripRealtimeScope>> captured = pending;
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    Instant at = Instant.now();
                    captured.forEach((tid, sc) -> hub.broadcastDataChanged(tid, sc, at));
                }

                @Override
                public void afterCompletion(int status) {
                    TransactionSynchronizationManager.unbindResourceIfPossible(TX_RESOURCE_KEY);
                }
            });
        }

        pending.computeIfAbsent(tripId, ignored -> EnumSet.noneOf(TripRealtimeScope.class))
                .addAll(scopes);
    }
}

