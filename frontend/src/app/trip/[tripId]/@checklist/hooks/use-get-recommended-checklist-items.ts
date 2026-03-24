import { useQuery } from '@tanstack/react-query';
import { getRecommendedChecklistItems } from '@/api/checklist/api';

export const useGetRecommendedChecklistItems = (tripId: number) => {
  return useQuery({
    queryKey: ['trip-checklist-recommended', tripId],
    queryFn: () => getRecommendedChecklistItems(tripId),
    enabled: Boolean(tripId) && !Number.isNaN(tripId),
  });
};

