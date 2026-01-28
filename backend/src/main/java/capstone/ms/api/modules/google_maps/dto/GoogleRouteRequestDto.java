package capstone.ms.api.modules.google_maps.dto;

import capstone.ms.api.modules.itinerary.dto.travel_segment.ComputeRouteRequestDto;
import lombok.Data;

@Data
public class GoogleRouteRequestDto {

    private Place origin;
    private Place destination;
    private String travelMode;

    @Data
    public static class Place {
        private String placeId;
    }

    public static GoogleRouteRequestDto from(ComputeRouteRequestDto dto, String googleMode) {
        GoogleRouteRequestDto req = new GoogleRouteRequestDto();

        Place origin = new Place();
        origin.setPlaceId(dto.getStartPlaceId());

        Place destination = new Place();
        destination.setPlaceId(dto.getEndPlaceId());

        req.setOrigin(origin);
        req.setDestination(destination);
        req.setTravelMode(googleMode);

        return req;
    }
}
