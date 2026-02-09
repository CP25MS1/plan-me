package capstone.ms.api.modules.itinerary.dto.tripmate;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class TripmateDto {
    private PublicUserInfo user;
}
