package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.InviteTripRequestDto;
import capstone.ms.api.modules.itinerary.dto.InviteTripResponseDto;
import capstone.ms.api.modules.itinerary.services.TripmateService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/trips")
public class TripmateController {
    private final TripmateService tripmateService;

    @PostMapping("/{tripId}/invites")
    public ResponseEntity<InviteTripResponseDto> inviteTripmates(@PathVariable Integer tripId,
                                                                 @Valid @RequestBody InviteTripRequestDto request,
                                                                 @AuthenticationPrincipal User currentUser) {
        InviteTripResponseDto response = tripmateService.inviteTripmates(tripId, currentUser, request);
        return ResponseEntity.ok(response);
    }
}
