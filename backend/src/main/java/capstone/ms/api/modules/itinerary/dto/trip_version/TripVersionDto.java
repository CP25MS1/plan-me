package capstone.ms.api.modules.itinerary.dto.trip_version;

import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
public class TripVersionDto extends BaseTripVersionDto {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private TripOverviewDto snapshot;
}

