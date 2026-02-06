package capstone.ms.api.modules.itinerary.dto.checklist;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateTripChecklistRequest {
    @NotNull
    @Size(max = 30)
    private final String name;
}