import { useQuery } from '@tanstack/react-query';
import { getTripBudgetSummary } from '@/api/budget/api';
import { TripBudgetDto } from '@/api/budget/type';

export const useGetTripBudget = (tripId: number) => {
  return useQuery<TripBudgetDto>({
    queryKey: ['tripBudget', tripId],
    queryFn: () => getTripBudgetSummary(tripId),
    enabled: !!tripId,
    staleTime: 0,
  });
};
