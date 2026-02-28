'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TripVisibility, toggleTripVisibility } from '@/api/trips';
import { useAppDispatch } from '@/store';
import { setTripVisibility } from '@/store/trip-detail-slice';

type ToggleTripVisibilityVars = {
  tripId: number;
  visibility: TripVisibility;
};

export const useToggleTripVisibility = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, visibility }: ToggleTripVisibilityVars) =>
      toggleTripVisibility(tripId, { visibility }),
    onSuccess: (data) => {
      dispatch(setTripVisibility({ tripId: data.tripId, visibility: data.visibility }));
      queryClient.invalidateQueries({ queryKey: ['trip-overview', data.tripId] });
      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
    },
  });
};
