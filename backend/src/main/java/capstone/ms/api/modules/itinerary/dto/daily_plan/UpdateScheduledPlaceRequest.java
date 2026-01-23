package capstone.ms.api.modules.itinerary.dto.daily_plan;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateScheduledPlaceRequest {
    @NotNull
    private Integer planId;
    private String notes;
    @NotNull
    private Short order;
}
