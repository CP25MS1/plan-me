import { useMutation, useQueryClient } from '@tanstack/react-query';

import { editExpense } from '@/api/budget/api';
import type { TripExpenseDto, UpdateTripExpenseRequest } from '@/api/budget/type';

type Args = {
  expenseId: number;
  payload: UpdateTripExpenseRequest;
};

export const useUpdateTripExpense = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation<TripExpenseDto, Error, Args>({
    mutationKey: ['updateTripExpense', tripId],

    mutationFn: ({ expenseId, payload }) => editExpense(tripId, expenseId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripExpenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripBudget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripDebtSummary', tripId] });
    },
  });
};

