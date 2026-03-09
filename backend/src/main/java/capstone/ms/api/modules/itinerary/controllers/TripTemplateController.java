package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.TripTemplateDetailDto;
import capstone.ms.api.modules.itinerary.dto.TripTemplateListResponse;
import capstone.ms.api.modules.itinerary.services.TripTemplateService;
import capstone.ms.api.modules.itinerary.dto.UpsertTripDto;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/trip-templates")
public class TripTemplateController {
    private final TripTemplateService tripTemplateService;

    @GetMapping("/public")
    public ResponseEntity<TripTemplateListResponse> listPublicTemplates(@RequestParam(value = "limit", required = false) Integer limit,
                                                                        @RequestParam(value = "cursor", required = false) String cursor) {
        return ResponseEntity.ok(tripTemplateService.listPublicTemplates(limit, cursor));
    }

    @GetMapping("/public/{templateTripId}")
    public ResponseEntity<TripTemplateDetailDto> getPublicTemplate(@PathVariable Integer templateTripId) {
        return ResponseEntity.ok(tripTemplateService.getPublicTemplateDetail(templateTripId));
    }

    @PostMapping("/public/{templateTripId}/trips")
    public ResponseEntity<TripOverviewDto> createTripFromTemplate(@AuthenticationPrincipal User currentUser,
                                                                  @PathVariable Integer templateTripId,
                                                                  @Valid @RequestBody final UpsertTripDto tripInfo) {
        TripOverviewDto created = tripTemplateService.createTripFromPublicTemplate(templateTripId, tripInfo, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
