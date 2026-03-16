import type { TripExpenseDto } from '@/api/budget/type';

const toCents = (n: number) => Math.round(n * 100);

export const sumSplitsAmount = (splits: Array<{ amount: number }>) => {
  const cents = splits.reduce((sum, s) => sum + toCents(Number(s.amount ?? 0)), 0);
  return cents / 100;
};

export const getExpenseTotal = (expense: Pick<TripExpenseDto, 'splits'>) => {
  return sumSplitsAmount(expense.splits ?? []);
};

export const getExpenseAmountForParticipant = (
  expense: Pick<TripExpenseDto, 'splits'>,
  participantUserId: number
) => {
  const cents = (expense.splits ?? []).reduce((sum, s) => {
    if (s.participant?.id !== participantUserId) return sum;
    return sum + toCents(Number(s.amount ?? 0));
  }, 0);

  return cents / 100;
};

export const getExpensesTotal = (expenses: Array<Pick<TripExpenseDto, 'splits'>>) => {
  const cents = expenses.reduce(
    (sum, e) => sum + (e.splits ?? []).reduce((inner, s) => inner + toCents(Number(s.amount ?? 0)), 0),
    0
  );
  return cents / 100;
};
