package capstone.ms.api.modules.itinerary.dto.daily_plan;

import capstone.ms.api.modules.google_maps.dto.GoogleMapPlaceDto;

public record TripScheduledPlaceDto(
        Integer id,
        String notes,
        Short order,
        GoogleMapPlaceDto ggmp
) {
}

