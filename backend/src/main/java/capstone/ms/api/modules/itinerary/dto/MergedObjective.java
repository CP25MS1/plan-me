package capstone.ms.api.modules.itinerary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MergedObjective {
    private final Integer id;
    private final Integer boId;
    @JsonProperty("TH")
    private final String thName;
    @JsonProperty("EN")
    private final String enName;

    private final String name; // If this belongs to BasicObjective, use TH by default.
    private final String badgeColor;
}
