import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createScheduledPlace,
  CreateScheduledPlaceRequest,
  deleteScheduledPlace,
  updateScheduledPlace,
  UpdateScheduledPlaceRequest,
} from '@/api/daily-plan';

export const useAddScheduledPlace = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduledPlaceRequest) => createScheduledPlace(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
    },
  });
};

export const useUpdateScheduledPlace = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      placeId,
      payload,
    }: {
      placeId: number;
      payload: UpdateScheduledPlaceRequest;
    }) => updateScheduledPlace(tripId, placeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
    },
  });
};

export const useRemoveScheduledPlace = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: number) => deleteScheduledPlace(tripId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
    },
  });
};
