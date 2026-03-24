package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.*;
import capstone.ms.api.modules.itinerary.dto.daily_plan.CreateScheduledPlaceRequest;
import capstone.ms.api.modules.itinerary.dto.daily_plan.ScheduledPlaceDto;
import capstone.ms.api.modules.itinerary.dto.daily_plan.UpdateScheduledPlaceRequest;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionResponse;
import capstone.ms.api.modules.itinerary.dto.trip_version.TripVersionDto;
import capstone.ms.api.modules.itinerary.dto.visibility.UpdateTripVisibilityRequest;
import capstone.ms.api.modules.itinerary.dto.visibility.UpdateTripVisibilityResponse;
import capstone.ms.api.modules.itinerary.services.TripService;
import capstone.ms.api.modules.itinerary.services.daily_plan.DailyPlanService;
import capstone.ms.api.modules.itinerary.services.TripBudgetService;
import capstone.ms.api.modules.itinerary.services.TripVersionService;
import capstone.ms.api.modules.itinerary.dto.trip_version.CreateTripVersionRequest;
import capstone.ms.api.modules.itinerary.services.TripDebtService;
import capstone.ms.api.modules.itinerary.dto.TripBudgetSummaryDto;
import capstone.ms.api.modules.itinerary.dto.UpsertTripBudgetRequest;
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
    private final DailyPlanService dailyPlanService;
    private final TripBudgetService tripBudgetService;
    private final TripDebtService tripDebtService;
    private final TripVersionService tripVersionService;

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
        List<TripDto> trips = tripService.getTripsByUser(currentUser);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{tripId}/overview")
    public ResponseEntity<TripOverviewDto> getTripOverview(@PathVariable Integer tripId,
                                                           @AuthenticationPrincipal User currentUser) {
        TripOverviewDto overview = tripService.getTripOverview(tripId, currentUser);
        return ResponseEntity.ok(overview);
    }

    @PostMapping("/{tripId}/versions")
    public ResponseEntity<CreateTripVersionResponse> createTripVersion(@PathVariable Integer tripId,
                                                                       @AuthenticationPrincipal User currentUser,
                                                                       @Valid @RequestBody CreateTripVersionRequest request) {
        CreateTripVersionResponse response = tripVersionService.createVersion(tripId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{tripId}/versions/{versionId}")
    public ResponseEntity<Void> deleteTripVersion(@PathVariable Integer tripId,
                                                  @PathVariable Integer versionId,
                                                  @AuthenticationPrincipal User currentUser) {
        tripVersionService.deleteVersion(tripId, versionId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tripId}/versions")
    public ResponseEntity<List<TripVersionDto>> listTripVersions(@PathVariable Integer tripId,
                                                                 @RequestParam(name = "includeSnapshot", required = false, defaultValue = "false") Boolean includeSnapshot,
                                                                 @AuthenticationPrincipal User currentUser) {
        List<TripVersionDto> versions = tripVersionService.listVersions(tripId, includeSnapshot, currentUser);
        return ResponseEntity.ok(versions);
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripOverviewDto> updateTripOverview(
            @AuthenticationPrincipal final User currentUser,
            @PathVariable final Integer tripId,
            @Valid @RequestBody final UpsertTripDto tripInfo
    ) {
        return ResponseEntity.ok(tripService.updateTripOverview(currentUser, tripId, tripInfo));
    }

    @PatchMapping("/{tripId}/visibility")
    public ResponseEntity<UpdateTripVisibilityResponse> updateTripVisibility(@PathVariable Integer tripId,
                                                                             @Valid @RequestBody UpdateTripVisibilityRequest request,
                                                                             @AuthenticationPrincipal User currentUser) {
        UpdateTripVisibilityResponse response = tripService.updateTripVisibility(currentUser, tripId, request.getVisibility());
        return ResponseEntity.ok(response);
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

    @PostMapping("/{tripId}/scheduled-places")
    public ResponseEntity<ScheduledPlaceDto> createScheduledPlace(
            @AuthenticationPrincipal final User currentUser,
            @PathVariable final Integer tripId,
            @Valid @RequestBody final CreateScheduledPlaceRequest request
    ) {
        final ScheduledPlaceDto scheduledPlace = dailyPlanService.createScheduledPlace(currentUser, tripId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduledPlace);
    }

    @PutMapping("/{tripId}/scheduled-places/{placeId}")
    public ResponseEntity<ScheduledPlaceDto> updateScheduledPlace(
            @AuthenticationPrincipal final User currentUser,
            @PathVariable final Integer tripId,
            @PathVariable final Integer placeId,
            @Valid @RequestBody final UpdateScheduledPlaceRequest request
    ) {
        final ScheduledPlaceDto scheduledPlaceDto = dailyPlanService.updateScheduledPlace(currentUser, tripId, placeId, request);
        return ResponseEntity.ok(scheduledPlaceDto);
    }

    @DeleteMapping("/{tripId}/scheduled-places/{placeId}")
    public ResponseEntity<Void> deleteScheduledPlace(
            @AuthenticationPrincipal final User currentUser,
            @PathVariable final Integer tripId,
            @PathVariable final Integer placeId
    ) {
        dailyPlanService.deleteScheduledPlace(currentUser, tripId, placeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@AuthenticationPrincipal final User currentUser,
                                           @PathVariable final Integer tripId) {
        tripService.deleteTrip(currentUser, tripId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tripId}/budget")
    public ResponseEntity<TripBudgetSummaryDto> getTripBudget(@PathVariable Integer tripId,
                                                             @AuthenticationPrincipal User currentUser) {
        TripBudgetSummaryDto dto = tripBudgetService.getTripBudgetSummary(tripId, currentUser);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{tripId}/budget")
    public ResponseEntity<TripBudgetSummaryDto> upsertTripBudget(@PathVariable Integer tripId,
                                                                 @Valid @RequestBody UpsertTripBudgetRequest request,
                                                                 @AuthenticationPrincipal User currentUser) {
        TripBudgetSummaryDto dto = tripBudgetService.upsertTripBudget(tripId, request, currentUser);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{tripId}/debts/me")
    public ResponseEntity<MyDebtSummaryResponse> getMyDebtSummary(@PathVariable Integer tripId,
                                                                  @AuthenticationPrincipal User currentUser) {
        MyDebtSummaryResponse response = tripDebtService.getMyDebtSummary(tripId, currentUser);
        return ResponseEntity.ok(response);
    }
}
