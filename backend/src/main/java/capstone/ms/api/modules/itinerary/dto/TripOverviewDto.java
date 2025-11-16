package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripOverviewDto {
    private final Integer id;
    private final String name;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final PublicUserInfo owner;
    private final Set<MergedObjective> objectives;
    private final Set<PublicUserInfo> tripmates;
    private final Set<Object> reservations;
    private final Set<WishlistPlaceDto> wishlistPlaces;
}
