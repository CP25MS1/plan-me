import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createScheduledPlace,
  CreateScheduledPlaceRequest,
  deleteScheduledPlace,
  updateScheduledPlace,
  UpdateScheduledPlaceRequest,
} from '@/api/daily-plan';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useAddScheduledPlace = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (payload: CreateScheduledPlaceRequest) => createScheduledPlace(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
      showSuccess(t('notification.success.add_place'));
    },
    onError: () => {
      showError(t('notification.error.add_place'));
    },
  });
};

export const useUpdateScheduledPlace = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

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
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};

export const useRemoveScheduledPlace = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (placeId: number) => deleteScheduledPlace(tripId, placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
      showSuccess(t('notification.success.remove_place'));
    },
    onError: () => {
      showError(t('notification.error.remove_place'));
    },
  });
};
