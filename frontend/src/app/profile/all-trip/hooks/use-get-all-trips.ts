'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllTrips } from '@/api/all/api';
import { TripOverview } from '@/api/trips/type';

export const useGetAllTrips = () => {
  return useQuery<TripOverview[]>({
    queryKey: ['all-trips'],
    queryFn: getAllTrips,
  });
};
