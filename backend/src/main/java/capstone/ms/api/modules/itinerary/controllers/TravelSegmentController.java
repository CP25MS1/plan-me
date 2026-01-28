package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.travel_segment.ComputeRouteRequestDto;
import capstone.ms.api.modules.itinerary.dto.travel_segment.TravelSegmentResponseDto;
import capstone.ms.api.modules.itinerary.services.TravelSegmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/travel-segments")
public class TravelSegmentController {

    private final TravelSegmentService travelSegmentService;

    @PostMapping
    public ResponseEntity<TravelSegmentResponseDto> createTravelSegment(@Valid @RequestBody ComputeRouteRequestDto requestDto) {
        final TravelSegmentResponseDto travelSegment = travelSegmentService.createSegment(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(travelSegment);
    }
}
