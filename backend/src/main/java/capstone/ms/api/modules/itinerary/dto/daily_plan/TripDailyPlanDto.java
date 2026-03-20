package capstone.ms.api.modules.itinerary.dto.daily_plan;

import java.time.LocalDate;
import java.util.List;

public record TripDailyPlanDto(
        Integer id,
        LocalDate date,
        String pinColor,
        List<TripScheduledPlaceDto> scheduledPlaces
) {
}

