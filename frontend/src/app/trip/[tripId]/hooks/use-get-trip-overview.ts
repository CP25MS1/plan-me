import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getTripOverview } from '@/api/trips';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTripOverview } from '@/store/trip-detail-slice';

export const useGetTripOverview = (tripId: number) => {
  const dispatch = useAppDispatch();

  const overview = useAppSelector((state) => state.tripDetail.overview);

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
    overview,
  };
};

export default useGetTripOverview;
