package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.checklist.CreateTripChecklistRequest;
import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.dto.checklist.UpdateTripChecklistRequest;
import capstone.ms.api.modules.itinerary.services.TripChecklistService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/trips/{tripId}/checklist-items")
public class TripChecklistController {
    private final TripChecklistService service;

    @PostMapping
    public ResponseEntity<TripChecklistDto> createTripChecklist(
            final @PathVariable Integer tripId,
            final @Valid @RequestBody CreateTripChecklistRequest request,
            final @AuthenticationPrincipal User currentUser
    ) {
        final TripChecklistDto createdChecklistItem = service.createTripChecklist(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdChecklistItem);
    }

    @GetMapping
    public ResponseEntity<List<TripChecklistDto>> getTripChecklist(
            final @PathVariable Integer tripId,
            final @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(service.getTripChecklist(tripId, currentUser));
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<TripChecklistDto> updateTripChecklist(
            final @PathVariable Integer tripId,
            final @Valid @RequestBody UpdateTripChecklistRequest request,
            final @AuthenticationPrincipal User currentUser,
            final @PathVariable Integer itemId
    ) {
        final TripChecklistDto updatedChecklistItem = service.updateTripChecklist(tripId, request, currentUser, itemId);
        return ResponseEntity.ok(updatedChecklistItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteTripChecklist(
            final @PathVariable Integer tripId,
            final @AuthenticationPrincipal User currentUser,
            final @PathVariable Integer itemId
    ) {
        service.deleteTripChecklist(tripId, currentUser, itemId);
        return ResponseEntity.noContent().build();
    }
}
