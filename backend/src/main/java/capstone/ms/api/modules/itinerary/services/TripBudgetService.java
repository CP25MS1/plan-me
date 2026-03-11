package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.itinerary.dto.TripBudgetSummaryDto;
import capstone.ms.api.modules.itinerary.entities.TripBudget;
import capstone.ms.api.modules.itinerary.repositories.TripBudgetRepository;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@AllArgsConstructor
public class TripBudgetService {
    private final TripBudgetRepository tripBudgetRepository;
    private final TripAccessService tripAccessService;
    private final TripResourceService tripResourceService;

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    public TripBudgetSummaryDto getTripBudgetSummary(Integer tripId, User currentUser) {
        tripResourceService.getTripOrThrow(tripId);
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        Optional<TripBudget> tripBudgetOpt = tripBudgetRepository.findById(tripId);

        if (tripBudgetOpt.isEmpty()) {
            return TripBudgetSummaryDto.builder()
                    .tripId(tripId)
                    .budgetConfigured(false)
                    .totalExpense(formatMoney(BigDecimal.ZERO))
                    .build();
        }

        TripBudget tripBudget = tripBudgetOpt.get();
        BigDecimal totalBudget = tripBudget.getTotalBudget();

        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal remainingBudget = totalBudget.subtract(totalExpense);
        boolean isOverBudget = remainingBudget.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal overBudgetAmount = isOverBudget ? remainingBudget.abs() : BigDecimal.ZERO;
        BigDecimal usagePercentage = BigDecimal.ZERO;

        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = totalExpense
                    .divide(totalBudget, 4, RoundingMode.HALF_UP)
                    .multiply(ONE_HUNDRED);
        }

        return TripBudgetSummaryDto.builder()
                .tripId(tripId)
                .budgetConfigured(true)
                .totalBudget(formatMoney(totalBudget))
                .totalExpense(formatMoney(totalExpense))
                .remainingBudget(formatMoney(remainingBudget))
                .usagePercentage(formatPercentage(usagePercentage))
                .isOverBudget(isOverBudget)
                .overBudgetAmount(formatMoney(overBudgetAmount))
                .build();
    }

    private String formatMoney(BigDecimal value) {
        if (value == null) return "0.00";
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String formatPercentage(BigDecimal value) {
        if (value == null) return "0.00";
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}

