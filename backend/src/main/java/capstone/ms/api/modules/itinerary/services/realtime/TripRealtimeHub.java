package capstone.ms.api.modules.itinerary.services.realtime;

import capstone.ms.api.modules.itinerary.dto.realtime.*;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class TripRealtimeHub {
    public static final Duration LOCK_LEASE_TTL = Duration.ofSeconds(45);
    public static final Duration ADD_PRESENCE_TTL = Duration.ofSeconds(60);
    private static final Duration KEEPALIVE_INTERVAL = Duration.ofSeconds(15);
    private static final Duration SWEEP_INTERVAL = Duration.ofSeconds(5);
    private static final String INITIAL_FLUSH_PADDING = "0".repeat(2048);

    private final ConcurrentHashMap<Integer, TripRoom> roomsByTripId = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler;

    public TripRealtimeHub() {
        this.scheduler = Executors.newSingleThreadScheduledExecutor(new NamedDaemonThreadFactory("trip-realtime-hub"));
        this.scheduler.scheduleWithFixedDelay(this::sendKeepalives, KEEPALIVE_INTERVAL.toSeconds(), KEEPALIVE_INTERVAL.toSeconds(), TimeUnit.SECONDS);
        this.scheduler.scheduleWithFixedDelay(this::sweepExpiredState, SWEEP_INTERVAL.toSeconds(), SWEEP_INTERVAL.toSeconds(), TimeUnit.SECONDS);
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdownNow();
    }

    private static void completeQuietly(SseEmitter emitter) {
        try {
            emitter.complete();
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
            if (lower.contains("responsebodyemitter") && lower.contains("already completed")) return true;
        }
        return false;
    }

    public SseEmitter subscribe(Integer tripId, TripRealtimeUserDto user) {
        String connectionId = UUID.randomUUID().toString();
        TripRoom room = roomsByTripId.computeIfAbsent(tripId, ignored -> new TripRoom(tripId));

        SseEmitter emitter = new SseEmitter(0L);
        room.addEmitter(connectionId, emitter);

        AtomicBoolean closed = new AtomicBoolean(false);

        emitter.onCompletion(() -> {
            if (!closed.compareAndSet(false, true)) return;
            room.removeEmitter(connectionId);
            log.info("TripRealtime SSE completed tripId={} userId={} connectionId={}", tripId, user.id(), connectionId);
        });
        emitter.onTimeout(() -> {
            if (closed.compareAndSet(false, true)) {
                room.removeEmitter(connectionId);
                log.info("TripRealtime SSE timeout tripId={} userId={} connectionId={}", tripId, user.id(), connectionId);
            }
            completeQuietly(emitter);
        });
        emitter.onError((ex) -> {
            if (closed.compareAndSet(false, true)) {
                room.removeEmitter(connectionId);
                if (isClientAbort(ex)) {
                    log.debug("TripRealtime SSE error (client abort) tripId={} userId={} connectionId={}: {}",
                            tripId, user.id(), connectionId, ex.toString());
                } else {
                    log.warn("TripRealtime SSE error tripId={} userId={} connectionId={}", tripId, user.id(), connectionId, ex);
                }
            }
            completeQuietly(emitter);
        });

        log.info("TripRealtime SSE connected tripId={} userId={} connectionId={}", tripId, user.id(), connectionId);

        try {
            emitter.send(SseEmitter.event().comment(INITIAL_FLUSH_PADDING));
            room.sendTo(emitter, "hello", new TripRealtimeHelloDto(Instant.now(), connectionId, user));
            room.sendTo(emitter, "snapshot", room.buildSnapshot(Instant.now()));
        } catch (Exception ex) {
            room.removeEmitter(connectionId);
            if (isClientAbort(ex)) {
                log.debug("TripRealtime SSE initial send failed (client abort) tripId={} userId={} connectionId={}: {}",
                        tripId, user.id(), connectionId, ex.toString());
            } else {
                log.warn("TripRealtime SSE initial send failed tripId={} userId={} connectionId={}", tripId, user.id(), connectionId, ex);
            }
            completeQuietly(emitter);
        }

        return emitter;
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

    private static final class TripRoom {
        private final Integer tripId;
        private final ConcurrentHashMap<String, SseEmitter> emittersByConnectionId = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<Integer, TripRealtimeAddPresenceDto> addPresenceByUserId = new ConcurrentHashMap<>();
        private final ConcurrentHashMap<String, TripRealtimeLockDto> locksByResourceKey = new ConcurrentHashMap<>();

        private TripRoom(Integer tripId) {
            this.tripId = tripId;
        }

        private void addEmitter(String connectionId, SseEmitter emitter) {
            emittersByConnectionId.put(connectionId, emitter);
        }

        private void removeEmitter(String connectionId) {
            emittersByConnectionId.remove(connectionId);
        }

        private boolean isEmpty() {
            return emittersByConnectionId.isEmpty() && locksByResourceKey.isEmpty() && addPresenceByUserId.isEmpty();
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
            emittersByConnectionId.forEach((connectionId, emitter) -> {
                try {
                    sendTo(emitter, eventName, payload);
                } catch (Exception ex) {
                    emittersByConnectionId.remove(connectionId, emitter);
                    if (isClientAbort(ex)) {
                        log.debug("TripRealtime SSE send failed (client abort) tripId={} connectionId={} event={}: {}",
                                tripId, connectionId, eventName, ex.toString());
                    } else {
                        log.warn("TripRealtime SSE send failed tripId={} connectionId={} event={}", tripId, connectionId, eventName, ex);
                    }
                    completeQuietly(emitter);
                }
            });
        }

        private void sendTo(SseEmitter emitter, String eventName, Object payload) throws IOException {
            emitter.send(SseEmitter.event().name(eventName).data(payload));
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
