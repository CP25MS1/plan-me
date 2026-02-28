'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllTrips, TripSummary } from '@/api/all';

export const useGetAllTrips = () => {
  return useQuery<TripSummary[]>({
    queryKey: ['all-trips'],
    queryFn: getAllTrips,
  });
};
