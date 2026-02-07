package capstone.ms.api.modules.itinerary.dto.checklist;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@ErrorMessage(messageKey = "400")
public class CreateTripChecklistRequest {
    @NotBlank
    @Size(max = 30)
    private final String name;
}