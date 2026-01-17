package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.modules.email.dto.EmailInfoDto;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDto;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationPreviewRequest;
import capstone.ms.api.modules.itinerary.services.ReservationExtractionService;
import capstone.ms.api.modules.itinerary.services.ReservationService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@AllArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    private final ReservationExtractionService reservationExtractionService;

    @PostMapping
    public ResponseEntity<ReservationDto> createReservation(@Valid @RequestBody ReservationDto dto,
                                                            @AuthenticationPrincipal User currentUser
    ) {
        ReservationDto created = reservationService.createReservation(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<ReservationDto>> createReservations(@Valid @RequestBody List<ReservationDto> dtoList,
                                                                   @AuthenticationPrincipal User currentUser
    ) {
        List<ReservationDto> created = dtoList.stream()
                .map(dto -> reservationService.createReservation(dto, currentUser))
                .toList();
        return ResponseEntity.status((HttpStatus.CREATED)).body(created);
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<ReservationDto> updateReservation(@PathVariable Integer reservationId,
                                                            @Valid @RequestBody ReservationDto reservationDto,
                                                            @AuthenticationPrincipal User currentUser
    ) {
        ReservationDto updated = reservationService.updateReservation(reservationId, reservationDto, currentUser);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/emails/check-info")
    public ResponseEntity<List<EmailInfoDto>> getAllReservations(@RequestParam(required = false) Integer tripId,
                                                                 @AuthenticationPrincipal User currentUser) {
        if (tripId == null) throw new BadRequestException("400");
        List<EmailInfoDto> emails = reservationService.checkEmailInfo(tripId, currentUser);
        return ResponseEntity.ok(emails);
    }

    @PostMapping("/emails/preview")
    public ResponseEntity<List<ReservationDto>> previewReservation(@Valid @RequestParam Integer tripId,
                                                                   @Valid @RequestBody List<ReservationPreviewRequest> previewRequest,
                                                                   @AuthenticationPrincipal User currentUser) {
        var previewResults = reservationExtractionService.previewReservations(tripId, previewRequest, currentUser);
        return ResponseEntity.ok(previewResults);
    }
}
