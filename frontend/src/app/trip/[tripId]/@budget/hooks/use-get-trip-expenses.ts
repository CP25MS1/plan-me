import { useQuery } from '@tanstack/react-query';
import { getTripExpenses } from '@/api/budget/api';
import { TripExpenseDto } from '@/api/budget/type';

export const useGetTripExpenses = (tripId: number) => {
  return useQuery<TripExpenseDto[]>({
    queryKey: ['tripExpenses', tripId],
    queryFn: () => getTripExpenses(tripId),
    enabled: !!tripId,
  });
};
