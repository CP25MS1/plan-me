import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTripExpense } from '@/api/budget/api';
import { CreateTripExpenseRequest, TripExpenseDto } from '@/api/budget/type';

export const useCreateTripExpense = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation<TripExpenseDto, Error, CreateTripExpenseRequest>({
    mutationKey: ['createTripExpense', tripId],

    mutationFn: (payload) => createTripExpense(tripId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tripExpenses', tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tripBudget', tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tripDebtSummary', tripId],
      });
    },
  });
};
