import { useQuery } from '@tanstack/react-query';

import { getTripDailyPlans, getTripHeader, getTripReservations, getTripWishlistPlaces } from './api';

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

