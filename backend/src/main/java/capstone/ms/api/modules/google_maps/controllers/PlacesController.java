package capstone.ms.api.modules.google_maps.controllers;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.google_maps.services.PlacesService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/places")
public class PlacesController {
    private final PlacesService placesService;

    @GetMapping("/search")
    public ResponseEntity<List<GoogleMapPlace>> search(@RequestParam(required = false) final String q) {
        if (q == null || q.isEmpty()) {
            throw new BadRequestException("400");
        }
        final List<GoogleMapPlace> places = placesService.searchText(q);
        return ResponseEntity.ok(places);
    }
}
