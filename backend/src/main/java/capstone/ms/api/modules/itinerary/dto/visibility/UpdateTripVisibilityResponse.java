package capstone.ms.api.modules.itinerary.dto.visibility;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateTripVisibilityResponse {
    private Integer tripId;
    private String visibility;
}
