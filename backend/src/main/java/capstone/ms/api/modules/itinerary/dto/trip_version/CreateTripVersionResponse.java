package capstone.ms.api.modules.itinerary.dto.trip_version;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
public class CreateTripVersionResponse extends BaseTripVersionDto {
}
