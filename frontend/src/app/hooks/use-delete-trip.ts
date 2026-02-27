'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTrip } from '@/api/trips';
import { useAppDispatch } from '@/store';
import { clearTripContextForDeletedTrip } from '@/store/trip-detail-slice';

type DeleteTripVars = {
  tripId: number;
};

export const useDeleteTrip = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId }: DeleteTripVars) => deleteTrip(tripId),
    onSuccess: (_, { tripId }) => {
      dispatch(clearTripContextForDeletedTrip({ tripId }));

      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-overview', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-checklist', tripId] });

      queryClient.removeQueries({ queryKey: ['trip-overview', tripId], exact: true });
      queryClient.removeQueries({ queryKey: ['trip-checklist', tripId], exact: true });
    },
  });
};
