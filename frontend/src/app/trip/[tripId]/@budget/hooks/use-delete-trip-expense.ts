import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteExpense } from '@/api/budget/api';

type Args = {
  expenseId: number;
};

export const useDeleteTripExpense = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Args>({
    mutationKey: ['deleteTripExpense', tripId],

    mutationFn: ({ expenseId }) => deleteExpense(tripId, expenseId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripExpenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripBudget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripDebtSummary', tripId] });
    },
  });
};

