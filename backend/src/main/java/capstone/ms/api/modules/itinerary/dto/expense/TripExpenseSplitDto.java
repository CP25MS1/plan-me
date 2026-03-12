package capstone.ms.api.modules.itinerary.dto.expense;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class TripExpenseSplitDto {
    private PublicUserInfo participant;
    private BigDecimal amount;
}
