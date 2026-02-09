package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.tripmate.*;
import capstone.ms.api.modules.itinerary.services.TripmateService;
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
@RequestMapping("/trips")
public class TripmateController {
    private final TripmateService tripmateService;

    @GetMapping("/pending-invitations/me")
    public ResponseEntity<List<PendingInvitationDto>> getMyReceivedInvitations(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(tripmateService.getReceivedInvitations(currentUser));
    }

    @PostMapping("/{tripId}/invites")
    public ResponseEntity<InviteTripResponseDto> inviteTripmates(@PathVariable Integer tripId,
                                                                 @Valid @RequestBody InviteTripRequestDto request,
                                                                 @AuthenticationPrincipal User currentUser) {
        InviteTripResponseDto response = tripmateService.inviteTripmates(tripId, currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @GetMapping("/{tripId}/tripmates")
    public ResponseEntity<TripmateResponseDto> getTripmates(@PathVariable Integer tripId,
                                                            @AuthenticationPrincipal User currentUser) {
        TripmateResponseDto response = tripmateService.getTripmates(tripId, currentUser);
        return ResponseEntity.ok(response);
    }
}
