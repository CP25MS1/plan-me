package capstone.ms.api.modules.google_maps.mappers;

import capstone.ms.api.modules.google_maps.dto.GoogleRouteResponseDto;
import capstone.ms.api.modules.itinerary.dto.RouteGoogleResultDto;
import capstone.ms.api.modules.itinerary.entities.TravelSegmentMode;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GoogleRoutesMapper {

    /* ---------- ระบบเรา → Google ---------- */
    static String toGoogleMode(TravelSegmentMode mode) {
        if (mode == null) {
            return "DRIVE";
        }

        return switch (mode) {
            case CAR -> "DRIVE";
            case MOTORCYCLE -> "TWO_WHEELER";
            case WALK -> "WALK";
        };
    }

    /* ---------- Google → ระบบเรา ---------- */
    default RouteGoogleResultDto toRouteResult(GoogleRouteResponseDto googleRoutesResponse, TravelSegmentMode mode) {
        if (googleRoutesResponse == null || googleRoutesResponse.getRoutes().isEmpty()) {
            throw new IllegalArgumentException("GoogleRoutesResponse is empty");
        }

        GoogleRouteResponseDto.Route route = googleRoutesResponse.getRoutes().getFirst();

        RouteGoogleResultDto dto = new RouteGoogleResultDto();
        dto.setDistanceMeters(route.getDistanceMeters());
        dto.setDurationSeconds(
                Integer.parseInt(route.getDuration().replace("s", ""))
        );
        dto.setMode(mode);

        return dto;
    }
}
