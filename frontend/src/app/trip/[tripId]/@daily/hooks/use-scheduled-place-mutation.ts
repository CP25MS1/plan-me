import { useMutation } from '@tanstack/react-query';
import {
  createScheduledPlace,
  CreateScheduledPlaceRequest,
  deleteScheduledPlace,
  updateScheduledPlace,
  UpdateScheduledPlaceRequest,
} from '@/api/daily-plan';

export const useAddScheduledPlace = () => {
  return useMutation({
    mutationFn: ({ tripId, payload }: { tripId: number; payload: CreateScheduledPlaceRequest }) =>
      createScheduledPlace(tripId, payload),
  });
};

export const useUpdateScheduledPlace = () => {
  return useMutation({
    mutationFn: ({
      tripId,
      placeId,
      payload,
    }: {
      tripId: number;
      placeId: number;
      payload: UpdateScheduledPlaceRequest;
    }) => updateScheduledPlace(tripId, placeId, payload),
  });
};

export const useRemoveScheduledPlace = () => {
  return useMutation({
    mutationFn: ({ tripId, placeId }: { tripId: number; placeId: number }) =>
      deleteScheduledPlace(tripId, placeId),
  });
};
