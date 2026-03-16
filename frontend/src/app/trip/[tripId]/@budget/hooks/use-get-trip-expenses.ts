import { useQuery } from '@tanstack/react-query';
import { getTripExpenses } from '@/api/budget/api';

export const useGetTripExpenses = (tripId: number) => {
  return useQuery({
    queryKey: ['tripExpenses', tripId],
    queryFn: () => getTripExpenses(tripId),
    enabled: !!tripId,
  });
};
