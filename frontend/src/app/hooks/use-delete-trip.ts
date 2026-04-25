import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { deleteTrip } from '@/api/trips';
import { useAppDispatch } from '@/store';
import { clearTripContextForDeletedTrip } from '@/store/trip-detail-slice';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

type DeleteTripVars = {
  tripId: number;
};

export const useDeleteTrip = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: ({ tripId }: DeleteTripVars) => deleteTrip(tripId),
    onSuccess: (_, { tripId }) => {
      showSuccess(t('notification.success.delete'));
      dispatch(clearTripContextForDeletedTrip({ tripId }));

      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-overview', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-checklist', tripId] });

      queryClient.removeQueries({ queryKey: ['trip-overview', tripId], exact: true });
      queryClient.removeQueries({ queryKey: ['trip-checklist', tripId], exact: true });
    },
    onError: () => {
      showError(t('notification.error.delete'));
    },
  });
};
