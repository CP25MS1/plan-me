import { useQuery } from '@tanstack/react-query';

import { getTripOverview } from '@/api/trips';

export const useTripOverview = (tripId: number) => {
  return useQuery({
    queryKey: ['trip-overview', tripId],
    queryFn: () => getTripOverview(tripId),
    enabled: !!tripId,
  });
};

export default useTripOverview;
