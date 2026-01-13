package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.*;
import capstone.ms.api.modules.itinerary.services.TripService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@AllArgsConstructor
@RequestMapping("/trips")
public class TripController {
    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripOverviewDto> createTrip(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody final UpsertTripDto tripInfo
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tripService.createTrip(tripInfo, user));
    }

    @GetMapping("/objectives")
    public ResponseEntity<Set<MergedObjective>> getAllDefaultObjectives() {
        return ResponseEntity.ok(tripService.getAllDefaultObjectives());
    }

    @GetMapping("/me")
    public ResponseEntity<List<TripDto>> getAllTrips(@AuthenticationPrincipal User currentUser) {
        List<TripDto> trips = tripService.getTripsByUser(currentUser.getId());
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{tripId}/overview")
    public ResponseEntity<TripOverviewDto> getTripOverview(@PathVariable Integer tripId,
                                                           @AuthenticationPrincipal User currentUser) {
        TripOverviewDto overview = tripService.getTripOverview(tripId, currentUser);
        return ResponseEntity.ok(overview);
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripOverviewDto> updateTripOverview(
            @AuthenticationPrincipal final User currentUser,
            @PathVariable final Integer tripId,
            @Valid @RequestBody final UpsertTripDto tripInfo
    ) {
        return ResponseEntity.ok(tripService.updateTripOverview(currentUser, tripId, tripInfo));
    }

    @PostMapping("/{tripId}/wishlist-places")
    public ResponseEntity<WishlistPlaceDto> addPlaceToWishlist(@AuthenticationPrincipal final User currentUser,
                                                               @PathVariable final Integer tripId,
                                                               @Valid @RequestBody AddWishlistPlaceDto request) {
        WishlistPlaceDto result = tripService.addPlaceToWishlist(tripId, request.getGgmpId(), currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PatchMapping("/{tripId}/wishlist-places/{placeId}")
    public ResponseEntity<UpdateWishlistPlaceNoteDto> updateWishlistPlaceNote(@AuthenticationPrincipal final User currentUser,
                                                                    @PathVariable Integer tripId,
                                                                    @PathVariable Integer placeId,
                                                                    @RequestBody UpdateWishlistPlaceNoteDto newNote) {
        UpdateWishlistPlaceNoteDto updated = tripService.updateWishlistPlaceNote(currentUser, tripId, placeId, newNote);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{tripId}/wishlist-places/{placeId}")
    public ResponseEntity<Void> removePlaceFromWishlist(@AuthenticationPrincipal final User currentUser,
                                                        @PathVariable Integer tripId,
                                                        @PathVariable Integer placeId) {
        tripService.removePlaceFromWishlist(currentUser, tripId, placeId);
        return ResponseEntity.noContent().build();
    }
}
