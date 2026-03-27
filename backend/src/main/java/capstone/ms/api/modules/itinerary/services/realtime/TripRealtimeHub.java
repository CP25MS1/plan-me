package capstone.ms.api.modules.itinerary.services.realtime;

import capstone.ms.api.modules.itinerary.dto.realtime.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class TripRealtimeHub {
    public static final Duration LOCK_LEASE_TTL = Duration.ofSeconds(45);
    public static final Duration ADD_PRESENCE_TTL = Duration.ofSeconds(60);
    private static final Duration KEEPALIVE_INTERVAL = Duration.ofSeconds(15);
    private static final Duration SWEEP_INTERVAL = Duration.ofSeconds(5);

    private final ConcurrentHashMap<Integer, TripRoom> roomsByTripId = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler;
    private final ObjectMapper objectMapper;

    public TripRealtimeHub(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.scheduler = Executors.newSingleThreadScheduledExecutor(new NamedDaemonThreadFactory("trip-realtime-hub"));
        this.scheduler.scheduleWithFixedDelay(this::sendKeepalives, KEEPALIVE_INTERVAL.toSeconds(), KEEPALIVE_INTERVAL.toSeconds(), TimeUnit.SECONDS);
        this.scheduler.scheduleWithFixedDelay(this::sweepExpiredState, SWEEP_INTERVAL.toSeconds(), SWEEP_INTERVAL.toSeconds(), TimeUnit.SECONDS);
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdownNow();
    }

    private static void closeQuietly(WebSocketSession session) {
        try {
            if (session.isOpen()) {
                session.close();
            }
        } catch (Exception ignored) {
        }
    }

    private static boolean isClientAbort(Throwable ex) {
        for (Throwable t = ex; t != null; t = t.getCause()) {
            String className = t.getClass().getName();
            if (className.endsWith("ClientAbortException")) return true;

            String msg = t.getMessage();
            if (msg == null) continue;
            String lower = msg.toLowerCase(Locale.ROOT);
            if (lower.contains("broken pipe")) return true;
            if (lower.contains("connection reset")) return true;
            if (lower.contains("connection aborted")) return true;
            if (lower.contains("client abort")) return true;
        }
        return false;
    }

    public void subscribe(Integer tripId, TripRealtimeUserDto user, WebSocketSession session) {
        String connectionId = session.getId();
        TripRoom room = roomsByTripId.computeIfAbsent(tripId, ignored -> new TripRoom(tripId));
        room.addSession(connectionId, session);

        log.info("TripRealtime WS connected tripId={} userId={} connectionId={}", tripId, user.id(), connectionId);

        try {
            room.sendTo(session, "hello", new TripRealtimeHelloDto(Instant.now(), connectionId, user));
            room.sendTo(session, "snapshot", room.buildSnapshot(Instant.now()));
        } catch (Exception ex) {
            room.removeSession(connectionId);
            if (isClientAbort(ex)) {
                log.debug("TripRealtime WS initial send failed (client abort) tripId={} userId={} connectionId={}: {}",
                        tripId, user.id(), connectionId, ex.toString());
            } else {
                log.warn("TripRealtime WS initial send failed tripId={} userId={} connectionId={}", tripId, user.id(), connectionId, ex);
            }
            closeQuietly(session);
        }
    }

    public void unsubscribe(Integer tripId, WebSocketSession session) {
        String connectionId = session.getId();
        TripRoom room = roomsByTripId.get(tripId);
        if (room != null) {
            room.removeSession(connectionId);
            cleanupRoomIfEmpty(tripId, room);
            log.info("TripRealtime WS disconnected tripId={} connectionId={}", tripId, connectionId);
        }
    }

    public void upsertAddPresence(
            Integer tripId,
            TripRealtimeSection section,
            Integer planId,
            TripRealtimeUserDto user
    ) {
        TripRoom room = roomsByTripId.computeIfAbsent(tripId, ignored -> new TripRoom(tripId));
        Instant now = Instant.now();

        TripRealtimeAddPresenceDto dto = new TripRealtimeAddPresenceDto(tripId, section, planId, user, now);
        room.upsertAddPresence(dto);
        room.broadcast("add_presence_upserted", dto);
    }

    public void clearAddPresence(Integer tripId, Integer userId) {
        TripRoom room = roomsByTripId.get(tripId);
        if (room == null) return;

        TripRealtimeAddPresenceDto cleared = room.removeAddPresence(userId);
        if (cleared != null) {
            room.broadcast("add_presence_cleared", cleared);
        }

        cleanupRoomIfEmpty(tripId, room);
    }

    public AcquireResult acquireLock(
            Integer tripId,
            TripRealtimeResourceType resourceType,
            Integer resourceId,
            Integer planId,
            TripRealtimeLockPurpose purpose,
            TripRealtimeUserDto user
    ) {
        TripRoom room = roomsByTripId.computeIfAbsent(tripId, ignored -> new TripRoom(tripId));
        Instant now = Instant.now();
        return room.acquireLock(resourceType, resourceId, planId, purpose, user, now);
    }

    public RenewResult renewLock(
            Integer tripId,
            TripRealtimeResourceType resourceType,
            Integer resourceId,
            TripRealtimeUserDto user
    ) {
        TripRoom room = roomsByTripId.get(tripId);
        if (room == null) return RenewResult.notFound();

        Instant now = Instant.now();
        return room.renewLock(resourceType, resourceId, user, now);
    }

    public ReleaseResult releaseLock(
            Integer tripId,
            TripRealtimeResourceType resourceType,
            Integer resourceId,
            TripRealtimeUserDto user
    ) {
        TripRoom room = roomsByTripId.get(tripId);
        if (room == null) return ReleaseResult.notFound();

        ReleaseResult result = room.releaseLock(resourceType, resourceId, user);
        cleanupRoomIfEmpty(tripId, room);
        return result;
    }

    public Optional<TripRealtimeLockDto> getActiveLock(Integer tripId, TripRealtimeResourceType resourceType, Integer resourceId, Instant now) {
        TripRoom room = roomsByTripId.get(tripId);
        if (room == null) return Optional.empty();
        return Optional.ofNullable(room.getActiveLock(resourceType, resourceId, now));
    }

    public void broadcastDataChanged(Integer tripId, Collection<TripRealtimeScope> scopes, Instant at) {
        TripRoom room = roomsByTripId.get(tripId);
        if (room == null) return;

        room.broadcast("data_changed", new TripRealtimeDataChangedDto(tripId, new ArrayList<>(new LinkedHashSet<>(scopes)), at));
    }

    private void sendKeepalives() {
        try {
            Instant now = Instant.now();
            roomsByTripId.forEach((tripId, room) -> room.broadcast("keepalive", new TripRealtimeKeepaliveDto(now)));
        } catch (Exception ex) {
            log.warn("TripRealtimeHub keepalive failed", ex);
        }
    }

    private void sweepExpiredState() {
        try {
            Instant now = Instant.now();
            roomsByTripId.forEach((tripId, room) -> {
                List<TripRealtimeLockDto> expiredLocks = room.removeExpiredLocks(now);
                expiredLocks.forEach(dto -> room.broadcast("lock_expired", dto));

                List<TripRealtimeAddPresenceDto> expiredPresence = room.removeExpiredAddPresence(now, ADD_PRESENCE_TTL);
                expiredPresence.forEach(dto -> room.broadcast("add_presence_cleared", dto));

                cleanupRoomIfEmpty(tripId, room);
            });
        } catch (Exception ex) {
            log.warn("TripRealtimeHub sweep failed", ex);
        }
    }

    private void cleanupRoomIfEmpty(Integer tripId, TripRoom room) {
        if (room.isEmpty()) {
            roomsByTripId.remove(tripId, room);
        }
    }

    private static TripRealtimeSection resolveSection(TripRealtimeResourceType resourceType) {
        return switch (resourceType) {
            case RESERVATION -> TripRealtimeSection.OVERVIEW_RESERVATIONS;
            case WISHLIST_PLACE -> TripRealtimeSection.OVERVIEW_WISHLIST;
            case SCHEDULED_PLACE -> TripRealtimeSection.DAILY_PLAN;
        };
    }

    public record AcquireResult(boolean acquired, TripRealtimeLockDto lock) {
        public static AcquireResult acquired(TripRealtimeLockDto lock) {
            return new AcquireResult(true, lock);
        }

        public static AcquireResult conflict(TripRealtimeLockDto lock) {
            return new AcquireResult(false, lock);
        }
    }

    public enum RenewStatus {
        RENEWED,
        CONFLICT,
        NOT_FOUND
    }

    public record RenewResult(RenewStatus status, TripRealtimeLockDto lock) {
        public static RenewResult renewed(TripRealtimeLockDto lock) {
            return new RenewResult(RenewStatus.RENEWED, lock);
        }

        public static RenewResult conflict(TripRealtimeLockDto lock) {
            return new RenewResult(RenewStatus.CONFLICT, lock);
        }

        public static RenewResult notFound() {
            return new RenewResult(RenewStatus.NOT_FOUND, null);
        }
    }

    public enum ReleaseStatus {
        RELEASED,
        FORBIDDEN,
        NOT_FOUND
    }

    public record ReleaseResult(ReleaseStatus status, TripRealtimeLockDto lock) {
        public static ReleaseResult released(TripRealtimeLockDto lock) {
            return new ReleaseResult(ReleaseStatus.RELEASED, lock);
        }

        public static ReleaseResult forbidden(TripRealtimeLockDto lock) {
            return new ReleaseResult(ReleaseStatus.FORBIDDEN, lock);
        }

        public static ReleaseResult notFound() {
            return new ReleaseResult(ReleaseStatus.NOT_FOUND, null);
        }
    }
    
    public record WsMessageWrapper(String type, Object data) {}

    private final class TripRoom {
        private final Integer tripId;
        private final ConcurrentHashMap<String, WebSocketSession> sessionsByConnectionId = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<Integer, TripRealtimeAddPresenceDto> addPresenceByUserId = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, TripRealtimeLockDto> locksByResourceKey = new ConcurrentHashMap<>();

        private TripRoom(Integer tripId) {
            this.tripId = tripId;
        }

        private void addSession(String connectionId, WebSocketSession session) {
            sessionsByConnectionId.put(connectionId, session);
        }

        private void removeSession(String connectionId) {
            sessionsByConnectionId.remove(connectionId);
        }

        private boolean isEmpty() {
            return sessionsByConnectionId.isEmpty() && locksByResourceKey.isEmpty() && addPresenceByUserId.isEmpty();
        }

        private void upsertAddPresence(TripRealtimeAddPresenceDto dto) {
            addPresenceByUserId.put(dto.user().id(), dto);
        }

        private TripRealtimeAddPresenceDto removeAddPresence(Integer userId) {
            return addPresenceByUserId.remove(userId);
        }

        private TripRealtimeSnapshotDto buildSnapshot(Instant now) {
            removeExpiredLocks(now);
            removeExpiredAddPresence(now, ADD_PRESENCE_TTL);
            return new TripRealtimeSnapshotDto(
                    new ArrayList<>(locksByResourceKey.values()),
                    new ArrayList<>(addPresenceByUserId.values())
            );
        }

        private AcquireResult acquireLock(
                TripRealtimeResourceType resourceType,
                Integer resourceId,
                Integer planId,
                TripRealtimeLockPurpose purpose,
                TripRealtimeUserDto user,
                Instant now
        ) {
            String key = lockKey(resourceType, resourceId);
            TripRealtimeLockDto existing = locksByResourceKey.get(key);

            if (existing != null && isExpired(existing, now)) {
                locksByResourceKey.remove(key, existing);
                existing = null;
            }

            if (existing != null) {
                if (Objects.equals(existing.owner().id(), user.id())) {
                    TripRealtimeLockDto renewed = withNewExpiry(existing, now, purpose, planId);
                    locksByResourceKey.put(key, renewed);
                    return AcquireResult.acquired(renewed);
                }
                return AcquireResult.conflict(existing);
            }

            TripRealtimeLockDto created = new TripRealtimeLockDto(
                    tripId,
                    resolveSection(resourceType),
                    resourceType,
                    resourceId,
                    planId,
                    purpose,
                    user,
                    now,
                    now.plus(LOCK_LEASE_TTL)
            );
            locksByResourceKey.put(key, created);
            broadcast("lock_acquired", created);
            return AcquireResult.acquired(created);
        }

        private RenewResult renewLock(
                TripRealtimeResourceType resourceType,
                Integer resourceId,
                TripRealtimeUserDto user,
                Instant now
        ) {
            String key = lockKey(resourceType, resourceId);
            TripRealtimeLockDto existing = locksByResourceKey.get(key);
            if (existing == null) return RenewResult.notFound();
            if (isExpired(existing, now)) {
                locksByResourceKey.remove(key, existing);
                broadcast("lock_expired", existing);
                return RenewResult.notFound();
            }

            if (!Objects.equals(existing.owner().id(), user.id())) {
                return RenewResult.conflict(existing);
            }

            TripRealtimeLockDto renewed = withNewExpiry(existing, now, existing.purpose(), existing.planId());
            locksByResourceKey.put(key, renewed);
            return RenewResult.renewed(renewed);
        }

        private ReleaseResult releaseLock(
                TripRealtimeResourceType resourceType,
                Integer resourceId,
                TripRealtimeUserDto user
        ) {
            String key = lockKey(resourceType, resourceId);
            TripRealtimeLockDto existing = locksByResourceKey.get(key);
            if (existing == null) return ReleaseResult.notFound();

            if (!Objects.equals(existing.owner().id(), user.id())) {
                return ReleaseResult.forbidden(existing);
            }

            boolean removed = locksByResourceKey.remove(key, existing);
            if (!removed) return ReleaseResult.notFound();

            broadcast("lock_released", existing);
            return ReleaseResult.released(existing);
        }

        private TripRealtimeLockDto getActiveLock(TripRealtimeResourceType resourceType, Integer resourceId, Instant now) {
            String key = lockKey(resourceType, resourceId);
            TripRealtimeLockDto existing = locksByResourceKey.get(key);
            if (existing == null) return null;

            if (isExpired(existing, now)) {
                locksByResourceKey.remove(key, existing);
                broadcast("lock_expired", existing);
                return null;
            }

            return existing;
        }

        private List<TripRealtimeLockDto> removeExpiredLocks(Instant now) {
            List<TripRealtimeLockDto> expired = new ArrayList<>();
            locksByResourceKey.forEach((key, lock) -> {
                if (isExpired(lock, now) && locksByResourceKey.remove(key, lock)) {
                    expired.add(lock);
                }
            });
            return expired;
        }

        private List<TripRealtimeAddPresenceDto> removeExpiredAddPresence(Instant now, Duration ttl) {
            List<TripRealtimeAddPresenceDto> expired = new ArrayList<>();
            addPresenceByUserId.forEach((userId, presence) -> {
                if (presence.updatedAt().plus(ttl).isBefore(now) && addPresenceByUserId.remove(userId, presence)) {
                    expired.add(presence);
                }
            });
            return expired;
        }

        private void broadcast(String eventName, Object payload) {
            sessionsByConnectionId.forEach((connectionId, session) -> {
                try {
                    sendTo(session, eventName, payload);
                } catch (Exception ex) {
                    sessionsByConnectionId.remove(connectionId, session);
                    if (isClientAbort(ex)) {
                        log.debug("TripRealtime WS send failed (client abort) tripId={} connectionId={} event={}: {}",
                                tripId, connectionId, eventName, ex.toString());
                    } else {
                        log.warn("TripRealtime WS send failed tripId={} connectionId={} event={}", tripId, connectionId, eventName, ex);
                    }
                    closeQuietly(session);
                }
            });
        }

        private synchronized void sendTo(WebSocketSession session, String eventName, Object payload) throws IOException {
            if (session.isOpen()) {
                String msg = objectMapper.writeValueAsString(new WsMessageWrapper(eventName, payload));
                session.sendMessage(new TextMessage(msg));
            }
        }

        private static String lockKey(TripRealtimeResourceType resourceType, Integer resourceId) {
            return resourceType.name() + ":" + resourceId;
        }

        private static boolean isExpired(TripRealtimeLockDto lock, Instant now) {
            return lock.expiresAt() != null && lock.expiresAt().isBefore(now);
        }

        private static TripRealtimeLockDto withNewExpiry(
                TripRealtimeLockDto lock,
                Instant now,
                TripRealtimeLockPurpose purpose,
                Integer planId
        ) {
            return new TripRealtimeLockDto(
                    lock.tripId(),
                    lock.section(),
                    lock.resourceType(),
                    lock.resourceId(),
                    planId,
                    purpose,
                    lock.owner(),
                    lock.acquiredAt(),
                    now.plus(LOCK_LEASE_TTL)
            );
        }
    }

    private static final class NamedDaemonThreadFactory implements ThreadFactory {
        private final String baseName;
        private final AtomicInteger idx = new AtomicInteger(1);

        private NamedDaemonThreadFactory(String baseName) {
            this.baseName = baseName;
        }

        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r);
            t.setName(baseName + "-" + idx.getAndIncrement());
            t.setDaemon(true);
            return t;
        }
    }
}
