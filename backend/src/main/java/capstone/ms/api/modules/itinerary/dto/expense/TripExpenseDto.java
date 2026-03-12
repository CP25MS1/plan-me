package capstone.ms.api.modules.itinerary.dto.expense;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class TripExpenseDto {
    private Integer expenseId;
    private Integer tripId;
    private String name;
    private String type;
    private String splitType;
    private PublicUserInfo payer;
    private PublicUserInfo createdBy;
    private OffsetDateTime spentAt;
    private List<TripExpenseSplitDto> splits;
}
