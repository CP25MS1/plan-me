package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeAddPresenceRequest;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeLockKeyRequest;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeLockRequest;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimeHub;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimeService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/realtime/trips")
public class TripRealtimeController {
    private final TripRealtimeService realtimeService;


    @PutMapping("/{tripId}/add-presence")
    public ResponseEntity<Void> addPresence(
            @PathVariable Integer tripId,
            @Valid @RequestBody TripRealtimeAddPresenceRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        realtimeService.upsertAddPresence(tripId, request, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{tripId}/add-presence")
    public ResponseEntity<Void> clearPresence(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        realtimeService.clearAddPresence(tripId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/locks/acquire")
    public ResponseEntity<?> acquireLock(
            @PathVariable Integer tripId,
            @Valid @RequestBody TripRealtimeLockRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        TripRealtimeHub.AcquireResult result = realtimeService.acquireLock(tripId, request, currentUser);
        if (result.acquired()) {
            return ResponseEntity.ok(result.lock());
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(result.lock());
    }

    @PostMapping("/{tripId}/locks/renew")
    public ResponseEntity<?> renewLock(
            @PathVariable Integer tripId,
            @Valid @RequestBody TripRealtimeLockKeyRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        TripRealtimeHub.RenewResult result = realtimeService.renewLock(tripId, request, currentUser);
        return switch (result.status()) {
            case RENEWED -> ResponseEntity.ok(result.lock());
            case CONFLICT -> ResponseEntity.status(HttpStatus.CONFLICT).body(result.lock());
            case NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        };
    }

    @PostMapping("/{tripId}/locks/release")
    public ResponseEntity<?> releaseLock(
            @PathVariable Integer tripId,
            @Valid @RequestBody TripRealtimeLockKeyRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        TripRealtimeHub.ReleaseResult result = realtimeService.releaseLock(tripId, request, currentUser);
        return switch (result.status()) {
            case RELEASED -> ResponseEntity.noContent().build();
            case FORBIDDEN -> ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            case NOT_FOUND -> ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        };
    }
}
