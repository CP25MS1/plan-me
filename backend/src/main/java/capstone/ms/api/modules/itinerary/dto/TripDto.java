package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
public class TripDto {
    private final Integer id;
    private final String name;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final Set<MergedObjective> objectives;
    private final PublicUserInfo owner;
    private final String visibility;
}
