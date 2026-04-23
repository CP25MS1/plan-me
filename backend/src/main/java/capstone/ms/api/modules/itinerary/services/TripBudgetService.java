package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.modules.itinerary.dto.TripBudgetSummaryDto;
import capstone.ms.api.modules.itinerary.dto.UpsertTripBudgetRequest;
import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeScope;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripBudget;
import capstone.ms.api.modules.itinerary.entities.expense.TripExpense;
import capstone.ms.api.modules.itinerary.entities.expense.TripExpenseSplit;
import capstone.ms.api.modules.itinerary.repositories.TripBudgetRepository;
import capstone.ms.api.modules.itinerary.repositories.TripExpenseSplitRepository;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimePublisher;
import capstone.ms.api.modules.itinerary.services.realtime.TripRealtimeLockGuard;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

@Service
@AllArgsConstructor
public class TripBudgetService {
    private final TripBudgetRepository tripBudgetRepository;
    private final TripExpenseSplitRepository tripExpenseSplitRepository;
    private final TripAccessService tripAccessService;
    private final TripResourceService tripResourceService;
    private final TripRealtimeLockGuard tripRealtimeLockGuard;
    private final TripRealtimePublisher tripRealtimePublisher;

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
        tripRealtimeLockGuard.assertTripMutationAllowed(tripId, currentUser);

        BigDecimal totalBudget = request.getTotalBudget().setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        if (totalBudget.compareTo(BigDecimal.ZERO) <= 0) {
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

        tripRealtimePublisher.publishDataChangedAfterCommit(tripId, List.of(TripRealtimeScope.BUDGET));

        return buildSummary(tripId, saved.getTotalBudget());
    }

    private BigDecimal formatDecimal(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private boolean isPersonalExpense(TripExpense expense, List<TripExpenseSplit> splits) {
        if (splits.size() != 1 || expense.getPayer() == null) {
            return false;
        }

        TripExpenseSplit firstSplit = splits.getFirst();

        return firstSplit.getParticipant() != null && firstSplit.getParticipant().getId().equals(expense.getPayer().getId());
    }

    private TripBudgetSummaryDto buildSummary(Integer tripId, BigDecimal totalBudget) {
        BigDecimal zero = BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        List<TripExpenseSplit> allSplits = tripExpenseSplitRepository.findByTripIdWithExpenseAndParticipant(tripId);

        Map<TripExpense, List<TripExpenseSplit>> splitsByExpense =
                allSplits.stream()
                        .collect(Collectors.groupingBy(TripExpenseSplit::getExpense));

        BigDecimal totalExpense = splitsByExpense.entrySet().stream()
                .filter(entry -> !isPersonalExpense(entry.getKey(), entry.getValue()))
                .flatMap(entry -> entry.getValue().stream())
                .map(TripExpenseSplit::getAmount)
                .filter(Objects::nonNull)
                .reduce(zero, BigDecimal::add)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);

        BigDecimal remainingBudget = totalBudget.subtract(totalExpense).setScale(MONEY_SCALE, RoundingMode.HALF_UP);

        BigDecimal usagePercentage = zero;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            usagePercentage = totalExpense
                    .divide(totalBudget, 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        }

        boolean isOverBudget = totalExpense.compareTo(totalBudget) > 0;

        BigDecimal overBudgetAmount = isOverBudget
                ? totalExpense.subtract(totalBudget).max(zero).setScale(MONEY_SCALE, RoundingMode.HALF_UP)
                : zero;

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
