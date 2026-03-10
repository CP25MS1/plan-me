package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripTemplateItemDto {
    private final Integer templateTripId;
    private final String tripName;
    private final List<TemplateObjectiveDto> objectives;
    private final Integer dayCount;
    private final String coverImageUrl;
    private final PublicUserInfo owner;
}