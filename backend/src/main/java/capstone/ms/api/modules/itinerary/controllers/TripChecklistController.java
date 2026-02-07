package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.checklist.CreateTripChecklistRequest;
import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.services.TripChecklistService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/trips/{tripId}/checklist-items")
public class TripChecklistController {
    private final TripChecklistService service;

    @PostMapping
    public ResponseEntity<TripChecklistDto> createTripChecklist
            (
                    final @PathVariable Integer tripId,
                    final @Valid @RequestBody CreateTripChecklistRequest request,
                    final @AuthenticationPrincipal User currentUser
            ) {
        final TripChecklistDto createdChecklistItem = service.createTripChecklist(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdChecklistItem);
    }
}
