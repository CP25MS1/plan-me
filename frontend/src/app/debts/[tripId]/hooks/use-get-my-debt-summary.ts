import { useQuery } from '@tanstack/react-query';
import { getMyDebtSummary, MyDebtSummaryResponse } from '@/api/debt';

export const useGetMyDebtSummary = (tripId: number) => {
  return useQuery<MyDebtSummaryResponse>({
    queryKey: ['tripDebtSummary', tripId],
    queryFn: () => getMyDebtSummary(tripId),
    enabled: Number.isFinite(tripId) && tripId > 0,
    staleTime: 0,
  });
};
