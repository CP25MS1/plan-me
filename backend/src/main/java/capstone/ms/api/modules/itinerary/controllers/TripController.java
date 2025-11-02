package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.CreateTripDto;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.services.TripService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/trips")
public class TripController {
    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripOverviewDto> createTrip(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody final CreateTripDto tripInfo
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tripService.createTrip(tripInfo, user));
    }
}
