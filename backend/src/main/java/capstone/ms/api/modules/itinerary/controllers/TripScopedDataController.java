package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.WishlistPlaceDto;
import capstone.ms.api.modules.itinerary.dto.daily_plan.TripDailyPlanDto;
import capstone.ms.api.modules.itinerary.dto.header.TripHeaderDto;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDto;
import capstone.ms.api.modules.itinerary.services.TripScopedQueryService;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/trips")
public class TripScopedDataController {
    private final TripScopedQueryService tripScopedQueryService;

    @GetMapping("/{tripId}/header")
    public ResponseEntity<TripHeaderDto> getTripHeader(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tripScopedQueryService.getTripHeader(tripId, currentUser));
    }

    @GetMapping("/{tripId}/reservations")
    public ResponseEntity<List<ReservationDto>> getTripReservations(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tripScopedQueryService.getTripReservations(tripId, currentUser));
    }

    @GetMapping("/{tripId}/wishlist-places")
    public ResponseEntity<List<WishlistPlaceDto>> getTripWishlistPlaces(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tripScopedQueryService.getTripWishlistPlaces(tripId, currentUser));
    }

    @GetMapping("/{tripId}/daily-plans")
    public ResponseEntity<List<TripDailyPlanDto>> getTripDailyPlans(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(tripScopedQueryService.getTripDailyPlans(tripId, currentUser));
    }
}

