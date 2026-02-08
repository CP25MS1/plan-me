'use client';

import { useQuery } from '@tanstack/react-query';

import { getTripmates } from '@/api/invite/api';
import { TripmateResponseDto } from '@/api/invite/type';

export const TRIPMATES_QUERY_KEY = (tripId: number) => ['tripmates', tripId] as const;

export const useGetTripmates = (tripId: number) =>
  useQuery<TripmateResponseDto>({
    queryKey: TRIPMATES_QUERY_KEY(tripId),
    queryFn: () => getTripmates(tripId),
    enabled: !!tripId,
  });
