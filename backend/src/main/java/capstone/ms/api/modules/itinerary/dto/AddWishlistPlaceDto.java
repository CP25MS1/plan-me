package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ErrorMessage(messageKey = "place.400")
public class AddWishlistPlaceDto {
    @NotBlank(message = "ggmpId is required")
    private String ggmpId;
}
