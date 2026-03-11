package capstone.ms.api.modules.itinerary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripBudgetSummaryDto {
    private Integer tripId;
    private Boolean budgetConfigured;
    private String totalBudget;
    private String totalExpense;
    private String remainingBudget;
    private String usagePercentage;
    private Boolean isOverBudget;
    private String overBudgetAmount;
}
