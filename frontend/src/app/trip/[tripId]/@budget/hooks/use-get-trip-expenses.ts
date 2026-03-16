import { useQuery } from '@tanstack/react-query';
import { getTripExpenses } from '@/api/budget/api';
import type { TripExpenseListDto } from '@/api/budget/type';

export const useGetTripExpenses = (tripId: number) => {
  return useQuery<TripExpenseListDto>({
    queryKey: ['tripExpenses', tripId],
    queryFn: () => getTripExpenses(tripId),
    enabled: Number.isFinite(tripId) && tripId > 0,
    staleTime: 0,
  });
};
