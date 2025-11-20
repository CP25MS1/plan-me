import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getTripOverview } from '@/api/trips';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTripOverview } from '@/store/trip-detail-slice';

export const useGetTripOverview = (tripId: number) => {
  const dispatch = useAppDispatch();

  const trip = useAppSelector((state) => state.tripOverview.data);

  const query = useQuery({
    queryKey: ['trip-overview', tripId],
    queryFn: () => getTripOverview(tripId),
    enabled: !!tripId,
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setTripOverview(query.data));
    }
  }, [query.data, dispatch]);

  return {
    ...query,
    tripOverview: trip,
  };
};

export default useGetTripOverview;
