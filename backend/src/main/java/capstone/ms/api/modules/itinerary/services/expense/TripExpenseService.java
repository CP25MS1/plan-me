package capstone.ms.api.modules.itinerary.services.expense;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.expense.CreateTripExpenseRequest;
import capstone.ms.api.modules.itinerary.dto.expense.TripExpenseDto;
import capstone.ms.api.modules.itinerary.dto.expense.TripExpenseSplitDto;
import capstone.ms.api.modules.itinerary.dto.expense.TripExpenseSplitRequest;
import capstone.ms.api.modules.itinerary.dto.expense.UpdateTripExpenseRequest;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.expense.*;
import capstone.ms.api.modules.itinerary.repositories.TripDebtBalanceRepository;
import capstone.ms.api.modules.itinerary.repositories.TripExpenseRepository;
import capstone.ms.api.modules.itinerary.repositories.TripExpenseSplitRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.TripmateRepository;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.services.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TripExpenseService {
    private static final int MONEY_SCALE = 2;

    private final TripAccessService tripAccessService;
    private final TripRepository tripRepository;
    private final TripmateRepository tripmateRepository;
    private final TripExpenseRepository tripExpenseRepository;
    private final TripExpenseSplitRepository tripExpenseSplitRepository;
    private final TripDebtBalanceRepository tripDebtBalanceRepository;
    private final UserService userService;

    @Transactional
    public TripExpenseDto createExpense(Integer tripId, CreateTripExpenseRequest request, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        Trip lockedTrip = getTripForUpdate(tripId);
        Set<Integer> tripMemberIds = getTripMemberIds(lockedTrip);

        TripExpenseType type = requireExpenseType(request.getType());
        User payer = requireTripMember(request.getPayerUserId(), tripMemberIds);
        List<SplitInput> splitInputs = buildSplitInputs(request.getSplits(), tripMemberIds);

        TripExpense expense = new TripExpense();
        expense.setTrip(lockedTrip);
        expense.setName(request.getName().trim());
        expense.setType(type);
        expense.setPayer(payer);
        expense.setCreatedBy(currentUser);
        expense.setSpentAt(request.getSpentAt());

        TripExpense savedExpense = tripExpenseRepository.save(expense);
        tripExpenseSplitRepository.saveAll(toSplitEntities(savedExpense, splitInputs));

        if (!isNoSplit(payer.getId(), splitInputs)) {
            Map<DebtKey, BigDecimal> newDebt = buildDebtMap(payer.getId(), splitInputs);
            applyDebtDeltas(lockedTrip, Map.of(), newDebt, toUserMap(payer, splitInputs));
        }

        return toDto(savedExpense, payer, savedExpense.getCreatedBy(), splitInputs);
    }

    @Transactional
    public TripExpenseDto updateExpense(Integer tripId, Integer expenseId, UpdateTripExpenseRequest request, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        if (request.isSpentAtPresent()) {
            throw new BadRequestException("tripExpense.400", "tripExpense.400.spentAtImmutable");
        }

        Trip lockedTrip = getTripForUpdate(tripId);
        TripExpense expense = getExpenseOrThrow(expenseId, tripId);
        assertCreatorOnly(expense, currentUser);

        Set<Integer> tripMemberIds = getTripMemberIds(lockedTrip);
        TripExpenseType type = requireExpenseType(request.getType());
        User payer = requireTripMember(request.getPayerUserId(), tripMemberIds);
        List<SplitInput> splitInputs = buildSplitInputs(request.getSplits(), tripMemberIds);

        List<TripExpenseSplit> oldSplits = tripExpenseSplitRepository.findByExpenseIdWithParticipant(expenseId);
        Map<DebtKey, BigDecimal> oldDebt = buildDebtMapFromSplits(expense.getPayer().getId(), oldSplits);

        expense.setName(request.getName().trim());
        expense.setType(type);
        expense.setPayer(payer);

        tripExpenseRepository.save(expense);

        tripExpenseSplitRepository.deleteByExpense_Id(expenseId);
        tripExpenseSplitRepository.saveAll(toSplitEntities(expense, splitInputs));

        if (isNoSplit(payer.getId(), splitInputs)) {
            applyDebtDeltas(lockedTrip, oldDebt, Map.of(), toUserMap(payer, splitInputs));
        } else {
            Map<DebtKey, BigDecimal> newDebt = buildDebtMap(payer.getId(), splitInputs);
            applyDebtDeltas(lockedTrip, oldDebt, newDebt, toUserMap(payer, splitInputs));
        }

        return toDto(expense, payer, expense.getCreatedBy(), splitInputs);
    }

    @Transactional
    public void deleteExpense(Integer tripId, Integer expenseId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        Trip lockedTrip = getTripForUpdate(tripId);
        TripExpense expense = getExpenseOrThrow(expenseId, tripId);
        assertCreatorOnly(expense, currentUser);

        List<TripExpenseSplit> splits = tripExpenseSplitRepository.findByExpenseIdWithParticipant(expenseId);
        Map<DebtKey, BigDecimal> oldDebt = buildDebtMapFromSplits(expense.getPayer().getId(), splits);

        if (!oldDebt.isEmpty()) {
            applyDebtDeltas(lockedTrip, oldDebt, Map.of(), Map.of());
        }

        tripExpenseRepository.delete(expense);
        tripExpenseRepository.flush();
    }

    private Trip getTripForUpdate(Integer tripId) {
        return tripRepository.findByIdForUpdate(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
    }

    private TripExpense getExpenseOrThrow(Integer expenseId, Integer tripId) {
        return tripExpenseRepository.findByIdAndTripId(expenseId, tripId)
                .orElseThrow(() -> new NotFoundException("tripExpense.404"));
    }

    private void assertCreatorOnly(TripExpense expense, User currentUser) {
        if (!expense.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("tripExpense.403.creatorOnly");
        }
    }

    private TripExpenseType requireExpenseType(String raw) {
        TripExpenseType type = TripExpenseType.from(raw);
        if (type == null) {
            throw new BadRequestException("tripExpense.400", "tripExpense.400.typeInvalid");
        }
        return type;
    }

    private Set<Integer> getTripMemberIds(Trip trip) {
        Set<Integer> ids = new HashSet<>();
        ids.add(trip.getOwner().getId());
        tripmateRepository.findByTripId(trip.getId())
                .forEach(tripmate -> ids.add(tripmate.getUser().getId()));
        return ids;
    }

    private User requireTripMember(Integer userId, Set<Integer> tripMemberIds) {
        User user = userService.getUserOrThrow(userId);
        if (!tripMemberIds.contains(userId)) {
            throw new BadRequestException("tripExpense.400", "tripExpense.400.userNotInTrip");
        }
        return user;
    }

    private List<SplitInput> buildSplitInputs(List<TripExpenseSplitRequest> splits, Set<Integer> tripMemberIds) {
        if (splits == null || splits.isEmpty()) {
            throw new BadRequestException("tripExpense.400", "tripExpense.400.splitsEmpty");
        }

        Set<Integer> seen = new HashSet<>();
        List<SplitInput> results = new ArrayList<>();
        for (TripExpenseSplitRequest split : splits) {
            Integer participantId = split.getParticipantUserId();
            if (!seen.add(participantId)) {
                throw new BadRequestException("tripExpense.400", "tripExpense.400.duplicateParticipant");
            }

            User participant = requireTripMember(participantId, tripMemberIds);
            BigDecimal amount = scaleMoney(split.getAmount());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("tripExpense.400", "tripExpense.400.amountInvalid");
            }

            results.add(new SplitInput(participant, amount));
        }
        return results;
    }

    private List<TripExpenseSplit> toSplitEntities(TripExpense expense, List<SplitInput> splits) {
        List<TripExpenseSplit> entities = new ArrayList<>();
        for (SplitInput split : splits) {
            TripExpenseSplit entity = new TripExpenseSplit();
            entity.setId(new TripExpenseSplitId(expense.getId(), split.participant().getId()));
            entity.setExpense(expense);
            entity.setParticipant(split.participant());
            entity.setAmount(split.amount());
            entities.add(entity);
        }
        return entities;
    }

    private Map<DebtKey, BigDecimal> buildDebtMapFromSplits(Integer payerId, List<TripExpenseSplit> splits) {
        List<SplitInput> inputs = splits.stream()
                .map(split -> new SplitInput(split.getParticipant(), split.getAmount()))
                .toList();
        return buildDebtMap(payerId, inputs);
    }

    private Map<DebtKey, BigDecimal> buildDebtMap(Integer payerId, List<SplitInput> splits) {
        Map<DebtKey, BigDecimal> map = new HashMap<>();
        for (SplitInput split : splits) {
            Integer participantId = split.participant().getId();
            if (participantId.equals(payerId)) {
                continue;
            }
            DebtKey key = new DebtKey(participantId, payerId);
            map.merge(key, split.amount(), BigDecimal::add);
        }
        return map;
    }

    private void applyDebtDeltas(
            Trip trip,
            Map<DebtKey, BigDecimal> oldDebt,
            Map<DebtKey, BigDecimal> newDebt,
            Map<Integer, User> userMap
    ) {
        Set<DebtKey> keys = new HashSet<>();
        keys.addAll(oldDebt.keySet());
        keys.addAll(newDebt.keySet());

        for (DebtKey key : keys) {
            BigDecimal oldAmount = oldDebt.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal newAmount = newDebt.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal delta = newAmount.subtract(oldAmount);
            if (delta.signum() == 0) {
                continue;
            }
            applyDebtDelta(trip, key, delta, userMap);
        }
    }

    private void applyDebtDelta(Trip trip, DebtKey key, BigDecimal delta, Map<Integer, User> userMap) {
        TripDebtBalanceId id = new TripDebtBalanceId(trip.getId(), key.debtorId(), key.creditorId());
        TripDebtBalance balance = tripDebtBalanceRepository.findById(id).orElse(null);

        if (balance == null) {
            if (delta.signum() < 0) {
                throw new ServerErrorException("500");
            }
            TripDebtBalance newBalance = new TripDebtBalance();
            newBalance.setId(id);
            newBalance.setTrip(trip);
            newBalance.setDebtor(requireUser(userMap, key.debtorId()));
            newBalance.setCreditor(requireUser(userMap, key.creditorId()));
            newBalance.setAmount(scaleMoney(delta));
            tripDebtBalanceRepository.save(newBalance);
            return;
        }

        BigDecimal nextAmount = balance.getAmount().add(delta);
        if (nextAmount.signum() < 0) {
            throw new ServerErrorException("500");
        }

        if (nextAmount.signum() == 0) {
            tripDebtBalanceRepository.delete(balance);
            return;
        }

        balance.setAmount(scaleMoney(nextAmount));
        tripDebtBalanceRepository.save(balance);
    }

    private User requireUser(Map<Integer, User> userMap, Integer userId) {
        User user = userMap.get(userId);
        if (user != null) {
            return user;
        }
        return userService.getUserOrThrow(userId);
    }

    private Map<Integer, User> toUserMap(User payer, List<SplitInput> splits) {
        Map<Integer, User> map = new HashMap<>();
        map.put(payer.getId(), payer);
        for (SplitInput split : splits) {
            map.putIfAbsent(split.participant().getId(), split.participant());
        }
        return map;
    }

    private boolean isNoSplit(Integer payerId, List<SplitInput> splits) {
        return splits.size() == 1 && splits.get(0).participant().getId().equals(payerId);
    }

    private BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private TripExpenseDto toDto(
            TripExpense expense,
            User payer,
            User createdBy,
            List<SplitInput> splits
    ) {
        List<TripExpenseSplitDto> splitDtos = splits.stream()
                .map(split -> TripExpenseSplitDto.builder()
                        .participant(userService.toPublicUserInfo(split.participant()))
                        .amount(split.amount())
                        .build())
                .toList();

        return TripExpenseDto.builder()
                .expenseId(expense.getId())
                .tripId(expense.getTrip().getId())
                .name(expense.getName())
                .type(expense.getType().name())
                .splitType(isNoSplit(payer.getId(), splits) ? "NO_SPLIT" : "SPLIT")
                .payer(userService.toPublicUserInfo(payer))
                .createdBy(userService.toPublicUserInfo(createdBy))
                .spentAt(expense.getSpentAt())
                .splits(splitDtos)
                .build();
    }

    private record SplitInput(User participant, BigDecimal amount) {
    }

    private record DebtKey(Integer debtorId, Integer creditorId) {
    }
}
