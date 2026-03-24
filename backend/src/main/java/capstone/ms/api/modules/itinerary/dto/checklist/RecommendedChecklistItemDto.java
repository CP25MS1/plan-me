package capstone.ms.api.modules.itinerary.dto.checklist;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecommendedChecklistItemDto {
    private Integer id;

    @JsonProperty("TH")
    private String thName;

    @JsonProperty("EN")
    private String enName;
}

