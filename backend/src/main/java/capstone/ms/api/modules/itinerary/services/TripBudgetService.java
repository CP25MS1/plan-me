package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.modules.itinerary.dto.TripBudgetSummaryDto;
import capstone.ms.api.modules.itinerary.dto.UpsertTripBudgetRequest;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripBudget;
import capstone.ms.api.modules.itinerary.repositories.TripBudgetRepository;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

import jakarta.transaction.Transactional;

@Service
@AllArgsConstructor
public class TripBudgetService {
    private final TripBudgetRepository tripBudgetRepository;
    private final TripAccessService tripAccessService;
    private final TripResourceService tripResourceService;

    private static final int MONEY_SCALE = 2;

    public TripBudgetSummaryDto getTripBudgetSummary(Integer tripId, User currentUser) {
        tripResourceService.getTripOrThrow(tripId);
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        return tripBudgetRepository.findById(tripId)
                .map(budget -> buildSummary(tripId, budget.getTotalBudget()))
                .orElseGet(() -> TripBudgetSummaryDto.builder()
                        .tripId(tripId)
                        .budgetConfigured(false)
                        .totalExpense(formatDecimal(BigDecimal.ZERO))
                        .build());
    }

    @Transactional
    public TripBudgetSummaryDto upsertTripBudget(Integer tripId, UpsertTripBudgetRequest request, User currentUser) {
        Trip trip = tripResourceService.getTripOrThrow(tripId);
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        BigDecimal totalBudget = new BigDecimal(request.getTotalBudget()).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        if (totalBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("400", "tripBudget.400.negativeBudget");
        }

        TripBudget tripBudget = tripBudgetRepository.findById(tripId)
                .orElseGet(() -> {
                    TripBudget newBudget = new TripBudget();
                    newBudget.setTrip(trip);
                    return newBudget;
                });

        tripBudget.setTotalBudget(totalBudget);
        TripBudget saved = tripBudgetRepository.save(tripBudget);

        return buildSummary(tripId, saved.getTotalBudget());
    }

    private String formatDecimal(BigDecimal value) {
        return Objects.requireNonNullElse(value, BigDecimal.ZERO).setScale(MONEY_SCALE, RoundingMode.HALF_UP).toPlainString();
    }

    private TripBudgetSummaryDto buildSummary(Integer tripId, BigDecimal totalBudget) {
        BigDecimal totalExpense = BigDecimal.ZERO;
        BigDecimal remainingBudget = totalBudget.subtract(totalExpense);
        BigDecimal usagePercentage = BigDecimal.ZERO;
        boolean isOverBudget = false;
        BigDecimal overBudgetAmount = BigDecimal.ZERO;

        return TripBudgetSummaryDto.builder()
                .tripId(tripId)
                .budgetConfigured(true)
                .totalBudget(formatDecimal(totalBudget))
                .totalExpense(formatDecimal(totalExpense))
                .remainingBudget(formatDecimal(remainingBudget))
                .usagePercentage(formatDecimal(usagePercentage))
                .isOverBudget(isOverBudget)
                .overBudgetAmount(formatDecimal(overBudgetAmount))
                .build();
    }
}
