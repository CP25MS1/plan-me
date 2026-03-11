package capstone.ms.api.modules.itinerary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripBudgetSummaryDto {
    private Integer tripId;
    private Boolean budgetConfigured;
    private BigDecimal totalBudget;
    private BigDecimal totalExpense;
    private BigDecimal remainingBudget;
    private BigDecimal usagePercentage;
    private Boolean isOverBudget;
    private BigDecimal overBudgetAmount;
}
