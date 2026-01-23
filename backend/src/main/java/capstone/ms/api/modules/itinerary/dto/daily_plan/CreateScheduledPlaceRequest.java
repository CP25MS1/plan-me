package capstone.ms.api.modules.itinerary.dto.daily_plan;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateScheduledPlaceRequest {
    @NotNull
    private Integer planId;
    @NotNull
    private String ggmpId;
    private String notes;
}
