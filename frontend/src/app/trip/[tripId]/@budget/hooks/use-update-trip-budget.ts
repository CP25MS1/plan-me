import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripBudget } from '@/api/budget/api';
import { UpdateTripBudgetRequest, TripBudgetDto } from '@/api/budget/type';

export const useUpsertTripBudget = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTripBudgetRequest) => updateTripBudget(tripId, payload),

    onSuccess: (data: TripBudgetDto) => {
      queryClient.setQueryData(['tripBudget', tripId], data);
    },
  });
};
