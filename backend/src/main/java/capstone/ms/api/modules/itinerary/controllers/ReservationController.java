package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.ReservationDto;
import capstone.ms.api.modules.itinerary.dto.ReservationPreviewRequest;
import capstone.ms.api.modules.itinerary.dto.ReservationPreviewResult;
import capstone.ms.api.modules.itinerary.services.ReservationService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservations")
@AllArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationDto> createReservation(@Valid @RequestBody ReservationDto dto,
                                                            @AuthenticationPrincipal User currentUser
    ) {
        ReservationDto created = reservationService.createReservation(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<ReservationDto> updateReservation(@PathVariable Integer reservationId,
                                                            @Valid @RequestBody ReservationDto reservationDto,
                                                            @AuthenticationPrincipal User currentUser
    ) {
        ReservationDto updated = reservationService.updateReservation(reservationId, reservationDto, currentUser);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Integer reservationId,
                                                  @AuthenticationPrincipal User currentUser) {
        reservationService.deleteReservation(reservationId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/emails/preview")
    public ResponseEntity<List<ReservationPreviewResult<?>>> previewReservation(@Valid @RequestParam Integer tripId,
                                                                             @Valid @RequestBody List<ReservationPreviewRequest> previewRequest,
                                                                             @AuthenticationPrincipal User currentUser) {
       List<ReservationPreviewResult<?>> previewResults = reservationService.previewReservation(tripId, previewRequest, currentUser);
       return ResponseEntity.ok(previewResults);
    }

    @PostMapping("/imported-emails")
    public ResponseEntity<Void> addImportedEmails() {
        reservationService.addImportedEmails(null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/imported-emails/{itineraryId}")
    public ResponseEntity<Void> addImportedEmails(@PathVariable final String itineraryId) {
        reservationService.addImportedEmails(itineraryId);
        return ResponseEntity.ok().build();
    }
}
