package capstone.ms.api.modules.itinerary.dto.trip_version;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTripVersionRequest {
    @NotNull
    @NotBlank
    @Size(max = 30)
    private String versionName;
}
