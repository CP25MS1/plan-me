package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.services.ReservationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reservations")
@AllArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

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
