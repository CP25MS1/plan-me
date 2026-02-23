package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.memory.BulkDeleteTripMemoriesRequest;
import capstone.ms.api.modules.itinerary.dto.memory.CreateTripMemoryResponse;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemoryListResponse;
import capstone.ms.api.modules.itinerary.dto.memory.TripMemorySignedUrlResponse;
import capstone.ms.api.modules.itinerary.services.trip_memory.TripMemoryService;
import capstone.ms.api.modules.user.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/trips/{tripId}/album/memories")
public class TripMemoryController {
    private final TripMemoryService tripMemoryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CreateTripMemoryResponse> uploadMemories(
            @PathVariable Integer tripId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal User currentUser
    ) {
        CreateTripMemoryResponse response = tripMemoryService.uploadMemories(tripId, files, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> bulkDeleteMemories(
            @PathVariable Integer tripId,
            @RequestBody BulkDeleteTripMemoriesRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        List<Integer> memoryIds = request == null ? null : request.getMemoryIds();
        tripMemoryService.bulkDeleteMemories(tripId, memoryIds, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<TripMemoryListResponse> listMemories(
            @PathVariable Integer tripId,
            @RequestParam(value = "extensions", required = false) List<String> extensions,
            @RequestParam(value = "limit", required = false, defaultValue = "30") Integer limit,
            @RequestParam(value = "cursor", required = false) String cursor,
            @AuthenticationPrincipal User currentUser
    ) {
        TripMemoryListResponse response = tripMemoryService.listMemories(tripId, extensions, limit, cursor, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{memoryId}/signed-url")
    public ResponseEntity<TripMemorySignedUrlResponse> getSignedUrl(
            @PathVariable Integer tripId,
            @PathVariable Integer memoryId,
            @RequestParam(value = "extension", required = false) String extension,
            @AuthenticationPrincipal User currentUser
    ) {
        TripMemorySignedUrlResponse response = tripMemoryService.getMemorySignedUrl(tripId, memoryId, extension, currentUser);
        return ResponseEntity.ok(response);
    }
}
