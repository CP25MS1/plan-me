import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import {
  applyTripVersion,
  createTripVersion,
  deleteTripVersion,
  getTripDailyPlans,
  getTripHeader,
  getTripReservations,
  getTripVersions,
  getTripWishlistPlaces,
} from './api';

export const useTripHeader = (tripId: number) => {
  return useQuery({
    queryKey: ['trip-header', tripId],
    queryFn: () => getTripHeader(tripId),
    enabled: tripId > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useTripReservations = (tripId: number) => {
  return useQuery({
    queryKey: ['trip-reservations', tripId],
    queryFn: () => getTripReservations(tripId),
    enabled: tripId > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useTripWishlistPlaces = (tripId: number) => {
  return useQuery({
    queryKey: ['trip-wishlist-places', tripId],
    queryFn: () => getTripWishlistPlaces(tripId),
    enabled: tripId > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useTripDailyPlans = (tripId: number) => {
  return useQuery({
    queryKey: ['trip-daily-plans', tripId],
    queryFn: () => getTripDailyPlans(tripId),
    enabled: tripId > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useTripVersions = (
  tripId: number,
  includeSnapshot: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['trip-versions', tripId, includeSnapshot],
    queryFn: () => getTripVersions(tripId, includeSnapshot),
    enabled: tripId > 0 && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateTripVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, versionName }: { tripId: number; versionName: string }) =>
      createTripVersion(tripId, { versionName }),

    onSuccess: async (_, { tripId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['trip-versions', tripId],
      });
    },
  });
};

export const useDeleteTripVersion = () => {
  return useMutation({
    mutationFn: ({ tripId, versionId }: { tripId: number; versionId: number }) =>
      deleteTripVersion(tripId, versionId),
  });
};

export const useApplyTripVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, versionId }: { tripId: number; versionId: number }) =>
      applyTripVersion(tripId, versionId),

    onSuccess: async (_, { tripId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['trip-versions', tripId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['trip-overview', tripId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['trip-header', tripId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['trip-reservations', tripId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['trip-wishlist-places', tripId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['trip-daily-plans', tripId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['trip-checklist', tripId],
      });
    },
  });
};
