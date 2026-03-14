package capstone.ms.api.modules.itinerary.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripExpenseListDto {
    private List<TripExpenseDto> split;
    private List<TripExpenseDto> noSplit;
}
