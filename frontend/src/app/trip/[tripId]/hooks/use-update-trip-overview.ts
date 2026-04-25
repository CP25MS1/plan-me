import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripOverview, UpsertTrip } from '@/api/trips';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useUpdateTripOverview = (tripId: number) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: (tripInfo: UpsertTrip) => updateTripOverview(tripId, tripInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-header', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripId] });
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};

export default useUpdateTripOverview;
