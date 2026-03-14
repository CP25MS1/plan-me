package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.itinerary.dto.DebtItem;
import capstone.ms.api.modules.itinerary.dto.DebtSummarySection;
import capstone.ms.api.modules.itinerary.dto.MyDebtSummaryResponse;
import capstone.ms.api.modules.itinerary.entities.expense.TripExpense;
import capstone.ms.api.modules.itinerary.entities.expense.TripExpenseSplit;
import capstone.ms.api.modules.itinerary.repositories.TripExpenseSplitRepository;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@AllArgsConstructor
public class TripDebtService {
    private static final int MONEY_SCALE = 2;

    private final TripExpenseSplitRepository tripExpenseSplitRepository;
    private final TripAccessService tripAccessService;
    private final UserService userService;

    public MyDebtSummaryResponse getMyDebtSummary(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        List<TripExpenseSplit> splits =
                tripExpenseSplitRepository.findByTripIdWithExpenseAndParticipant(tripId);

        Map<Integer, BigDecimal> owedToMe = new HashMap<>();
        Map<Integer, BigDecimal> iOwe = new HashMap<>();
        Map<Integer, User> userMap = new HashMap<>();

        Integer currentUserId = currentUser.getId();

        for (TripExpenseSplit split : splits) {
            TripExpense expense = split.getExpense();
            User payer = expense.getPayer();
            User debtor = split.getParticipant();

            if (payer == null) continue;
            Integer payerId = payer.getId();
            Integer debtorId = debtor.getId();

            if (payerId.equals(debtorId)) continue;
            BigDecimal amount = split.getAmount();

            userMap.putIfAbsent(payerId, payer);
            userMap.putIfAbsent(debtorId, debtor);

            if (debtorId.equals(currentUserId)) {
                iOwe.merge(payerId, amount, BigDecimal::add);
            }

            if (payerId.equals(currentUserId)) {
                owedToMe.merge(debtorId, amount, BigDecimal::add);
            }
        }

        DebtSummarySection full = buildSection(owedToMe, iOwe, userMap);
        DebtSummarySection net = buildNetSection(owedToMe, iOwe, userMap);

        return MyDebtSummaryResponse.builder()
                .tripId(tripId)
                .full(full)
                .net(net)
                .build();
    }

    private DebtSummarySection buildSection(
            Map<Integer, BigDecimal> owedToMe,
            Map<Integer, BigDecimal> iOwe,
            Map<Integer, User> userMap
    ) {
        List<DebtItem> owedToMeList = owedToMe.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new DebtItem(
                        userService.toPublicUserInfo(userMap.get(e.getKey())),
                        scaleMoney(e.getValue())))
                .toList();

        List<DebtItem> iOweList = iOwe.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new DebtItem(
                        userService.toPublicUserInfo(userMap.get(e.getKey())),
                        scaleMoney(e.getValue())))
                .toList();

        return DebtSummarySection.builder()
                .owedToMe(owedToMeList)
                .iOwed(iOweList)
                .build();
    }

    private DebtSummarySection buildNetSection(
            Map<Integer, BigDecimal> owedToMe,
            Map<Integer, BigDecimal> iOwe,
            Map<Integer, User> userMap
    ) {
        Set<Integer> allUserIds = new HashSet<>();
        allUserIds.addAll(owedToMe.keySet());
        allUserIds.addAll(iOwe.keySet());

        Map<Integer, BigDecimal> netOwedToMe = new HashMap<>();
        Map<Integer, BigDecimal> netIOwe = new HashMap<>();

        for (Integer userId : allUserIds) {
            BigDecimal net = owedToMe.getOrDefault(userId, BigDecimal.ZERO)
                    .subtract(iOwe.getOrDefault(userId, BigDecimal.ZERO));

            int cmp = net.compareTo(BigDecimal.ZERO);

            if (cmp > 0) {
                netOwedToMe.put(userId, net);
            } else if (cmp < 0) {
                netIOwe.put(userId, net.abs());
            }
        }

        return buildSection(netOwedToMe, netIOwe, userMap);
    }

    private BigDecimal scaleMoney(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
