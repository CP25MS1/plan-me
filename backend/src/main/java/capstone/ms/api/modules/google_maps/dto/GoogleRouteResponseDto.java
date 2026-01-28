package capstone.ms.api.modules.google_maps.dto;

import lombok.Data;
import java.util.List;

@Data
public class GoogleRouteResponseDto {

    private List<Route> routes;

    @Data
    public static class Route {
        private Integer distanceMeters;
        private String duration;
    }
}

