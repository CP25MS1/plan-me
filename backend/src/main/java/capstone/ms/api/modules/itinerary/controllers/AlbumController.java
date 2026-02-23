package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.album.TripAlbumListResponse;
import capstone.ms.api.modules.itinerary.services.trip_memory.TripAlbumService;
import capstone.ms.api.modules.user.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/albums")
public class AlbumController {
    private final TripAlbumService tripAlbumService;

    @GetMapping("/me")
    public ResponseEntity<TripAlbumListResponse> listMyAccessibleAlbums(
            @RequestParam(value = "limit", required = false, defaultValue = "30") Integer limit,
            @RequestParam(value = "cursor", required = false) String cursor,
            @AuthenticationPrincipal User currentUser
    ) {
        TripAlbumListResponse response = tripAlbumService.listAccessibleAlbums(currentUser, limit, cursor);
        return ResponseEntity.ok(response);
    }
}
