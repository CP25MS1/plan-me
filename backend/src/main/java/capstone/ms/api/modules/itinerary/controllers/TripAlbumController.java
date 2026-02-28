package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.album.CreateTripAlbumResponse;
import capstone.ms.api.modules.itinerary.dto.album.TripAlbumSignedUrlsResponse;
import capstone.ms.api.modules.itinerary.services.trip_memory.TripAlbumService;
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
@RequestMapping("/trips/{tripId}/album")
public class TripAlbumController {
    private final TripAlbumService tripAlbumService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CreateTripAlbumResponse> createAlbum(
            @PathVariable Integer tripId,
            @RequestParam("name") String name,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal User currentUser
    ) {
        CreateTripAlbumResponse response = tripAlbumService.createAlbum(tripId, name, files, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAlbum(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        tripAlbumService.deleteAlbum(tripId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/signed-urls")
    public ResponseEntity<TripAlbumSignedUrlsResponse> getAlbumSignedUrls(
            @PathVariable Integer tripId,
            @AuthenticationPrincipal User currentUser
    ) {
        TripAlbumSignedUrlsResponse response = tripAlbumService.getAlbumSignedUrls(tripId, currentUser);
        return ResponseEntity.ok(response);
    }
}
