package capstone.ms.api.modules.itinerary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TemplateObjectiveDto {
    private final String name;
    private final String badgeColor;
}