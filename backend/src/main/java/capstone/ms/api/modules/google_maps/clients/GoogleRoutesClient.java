package capstone.ms.api.modules.google_maps.clients;

import capstone.ms.api.modules.google_maps.dto.GoogleRouteRequestDto;
import capstone.ms.api.modules.google_maps.dto.GoogleRouteResponseDto;
import capstone.ms.api.modules.google_maps.mappers.GoogleRoutesMapper;
import capstone.ms.api.modules.itinerary.dto.travel_segment.ComputeRouteRequestDto;
import capstone.ms.api.modules.itinerary.dto.travel_segment.RouteGoogleResultDto;
import capstone.ms.api.modules.itinerary.entities.TravelSegmentMode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class GoogleRoutesClient {

    private final WebClient webClient;
    private final GoogleRoutesMapper googleRoutesMapper;

    @Value("${google.places.api-key}")
    private String apiKey;

    @Value("${google.routes.base-url}")
    private String baseUrl;

    public RouteGoogleResultDto computeRoute(ComputeRouteRequestDto dto, TravelSegmentMode mode) {

        String googleMode = GoogleRoutesMapper.toGoogleMode(mode);
        GoogleRouteRequestDto googleRequest = GoogleRouteRequestDto.from(dto, googleMode);

        GoogleRouteResponseDto response = webClient.post()
                .uri(baseUrl + "/directions/v2:computeRoutes")
                .header("X-Goog-Api-Key", apiKey)
                .header("X-Goog-FieldMask",
                        "routes.distanceMeters,routes.duration")
                .bodyValue(googleRequest)
                .retrieve()
                .bodyToMono(GoogleRouteResponseDto.class)
                .block();

        if (response == null || response.getRoutes().isEmpty()) {
            throw new IllegalStateException("Google Routes API returned empty response");
        }

        return googleRoutesMapper.toRouteResult(response, mode);
    }
}

