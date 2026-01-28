package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@ErrorMessage(messageKey = "400")
public class ComputeRouteRequestDto {
    @NotNull
    private String startPlaceId;
    @NotNull
    private String endPlaceId;
    private String mode;
}
