package capstone.ms.api.modules.itinerary.dto.checklist;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateTripChecklistRequest {
    private final Integer assignedById;
    private final Integer assigneeId;

    @Size(max = 30)
    private final String name;
    private final Boolean completed;
}