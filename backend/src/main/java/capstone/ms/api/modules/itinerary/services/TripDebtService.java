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
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TripDebtService {
    private static final int MONEY_SCALE = 2;

    private final TripExpenseSplitRepository tripExpenseSplitRepository;
    private final TripAccessService tripAccessService;
    private final UserService userService;

    public MyDebtSummaryResponse getMyDebtSummary(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        List<TripExpenseSplit> allSplits = tripExpenseSplitRepository.findByTripIdWithExpenseAndParticipant(tripId);

        Map<TripExpense, List<TripExpenseSplit>> splitsByExpense = allSplits.stream()
                .collect(Collectors.groupingBy(TripExpenseSplit::getExpense));

        Map<Integer, BigDecimal> owedToMeMap = new HashMap<>();
        Map<Integer, BigDecimal> iOweMap = new HashMap<>();
        Map<Integer, User> userMap = new HashMap<>();

        for (Map.Entry<TripExpense, List<TripExpenseSplit>> entry : splitsByExpense.entrySet()) {
            TripExpense expense = entry.getKey();
            List<TripExpenseSplit> splits = entry.getValue();

            if (splits.isEmpty()) continue;

            User payer = expense.getPayer();
            if (payer == null) {
                continue;
            }

            for (TripExpenseSplit split : splits) {
                User debtor = split.getParticipant();
                BigDecimal amount = split.getAmount();

                if (debtor.getId().equals(payer.getId())) {
                    continue;
                }

                userMap.putIfAbsent(payer.getId(), payer);
                userMap.putIfAbsent(debtor.getId(), debtor);

                if (debtor.getId().equals(currentUser.getId())) {
                    iOweMap.merge(payer.getId(), amount, BigDecimal::add);
                }

                if (payer.getId().equals(currentUser.getId())) {
                    owedToMeMap.merge(debtor.getId(), amount, BigDecimal::add);
                }
            }
        }

        List<DebtItem> fullOwedToMe = owedToMeMap.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(e -> new DebtItem(
                        userService.toPublicUserInfo(userMap.get(e.getKey())),
                        scaleMoney(e.getValue())))
                .toList();

        List<DebtItem> fullIOwe = iOweMap.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(e -> new DebtItem(
                        userService.toPublicUserInfo(userMap.get(e.getKey())),
                        scaleMoney(e.getValue())))
                .toList();

        DebtSummarySection full = DebtSummarySection.builder()
                .owedToMe(fullOwedToMe)
                .iOwed(fullIOwe)
                .build();

        // Calculate net
        Set<Integer> allUserIds = new HashSet<>();
        allUserIds.addAll(owedToMeMap.keySet());
        allUserIds.addAll(iOweMap.keySet());

        Map<Integer, BigDecimal> netOwedToMe = new HashMap<>();
        Map<Integer, BigDecimal> netIOwe = new HashMap<>();

        for (Integer otherId : allUserIds) {
            BigDecimal owedToMe = owedToMeMap.getOrDefault(otherId, BigDecimal.ZERO);
            BigDecimal iOwe = iOweMap.getOrDefault(otherId, BigDecimal.ZERO);

            BigDecimal net = owedToMe.subtract(iOwe);
            int cmp = net.compareTo(BigDecimal.ZERO);
            if (cmp > 0) {
                netOwedToMe.put(otherId, net);
            } else if (cmp < 0) {
                netIOwe.put(otherId, net.abs());
            }
        }

        List<DebtItem> netOwedToMeList = netOwedToMe.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(e -> new DebtItem(
                        userService.toPublicUserInfo(userMap.get(e.getKey())),
                        scaleMoney(e.getValue())))
                .toList();

        List<DebtItem> netIOweList = netIOwe.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(e -> new DebtItem(
                        userService.toPublicUserInfo(userMap.get(e.getKey())),
                        scaleMoney(e.getValue())))
                .toList();

        DebtSummarySection net = DebtSummarySection.builder()
                .owedToMe(netOwedToMeList)
                .iOwed(netIOweList)
                .build();

        return MyDebtSummaryResponse.builder()
                .tripId(tripId)
                .full(full)
                .net(net)
                .build();
    }

    private BigDecimal scaleMoney(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
