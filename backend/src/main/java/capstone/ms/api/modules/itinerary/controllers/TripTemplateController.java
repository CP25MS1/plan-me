package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.TripTemplateListResponse;
import capstone.ms.api.modules.itinerary.services.TripTemplateService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/trip-templates")
public class TripTemplateController {
    private final TripTemplateService tripTemplateService;

    @GetMapping("/public")
    public ResponseEntity<TripTemplateListResponse> listPublicTemplates(
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "cursor", required = false) String cursor
    ) {
        return ResponseEntity.ok(tripTemplateService.listPublicTemplates(limit, cursor));
    }
}

