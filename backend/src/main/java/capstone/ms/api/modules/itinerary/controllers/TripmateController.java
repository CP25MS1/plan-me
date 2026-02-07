package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.tripmate.InviteActionResponseDto;
import capstone.ms.api.modules.itinerary.dto.tripmate.InviteTripRequestDto;
import capstone.ms.api.modules.itinerary.dto.tripmate.InviteTripResponseDto;
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

    @PostMapping("/{tripId}/invites/{invitationId}/accept")
    public ResponseEntity<InviteActionResponseDto> acceptTripInvite(@PathVariable Integer tripId,
                                                                    @PathVariable Integer invitationId,
                                                                    @AuthenticationPrincipal User currentUser) {
        InviteActionResponseDto response = tripmateService.acceptInvite(tripId, invitationId, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{tripId}/invites/{invitationId}/reject")
    public ResponseEntity<InviteActionResponseDto> rejectTripInvite(@PathVariable Integer tripId,
                                                                    @PathVariable Integer invitationId,
                                                                    @AuthenticationPrincipal User currentUser) {
        InviteActionResponseDto response = tripmateService.rejectInvite(tripId, invitationId, currentUser);
        return ResponseEntity.ok(response);
    }
}
