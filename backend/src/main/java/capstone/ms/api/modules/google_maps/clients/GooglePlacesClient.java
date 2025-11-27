package capstone.ms.api.modules.google_maps.clients;

import capstone.ms.api.modules.google_maps.dto.SearchPhotoResponse;
import capstone.ms.api.modules.google_maps.dto.TextSearchRequest;
import capstone.ms.api.modules.google_maps.dto.TextSearchResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "googlePlacesClient", url = "${google.places.base-url}")
public interface GooglePlacesClient {

    @PostMapping(value = "/v1/places:searchText",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    TextSearchResponse searchText(
            @RequestBody TextSearchRequest request,
            @RequestHeader("X-Goog-Api-Key") String apiKey,
            @RequestHeader("X-Goog-FieldMask") String fieldMask
    );

    @GetMapping(
            value = "/v1/{name}/media",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    SearchPhotoResponse searchPhoto(
            @PathVariable("name") String name,
            @RequestParam("maxWidthPx") int maxWidthPx,
            @RequestParam("skipHttpRedirect") boolean skipHttpRedirect,
            @RequestParam("key") String apiKey
    );
}
