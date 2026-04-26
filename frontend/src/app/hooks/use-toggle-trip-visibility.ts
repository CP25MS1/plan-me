import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { TripVisibility, toggleTripVisibility } from '@/api/trips';
import { useAppDispatch } from '@/store';
import { setTripVisibility } from '@/store/trip-detail-slice';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

type ToggleTripVisibilityVars = {
  tripId: number;
  visibility: TripVisibility;
};

export const useToggleTripVisibility = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: ({ tripId, visibility }: ToggleTripVisibilityVars) =>
      toggleTripVisibility(tripId, { visibility }),
    onSuccess: (data) => {
      showSuccess(t('notification.success.update'));
      dispatch(setTripVisibility({ tripId: data.tripId, visibility: data.visibility }));
      queryClient.invalidateQueries({ queryKey: ['trip-overview', data.tripId] });
      queryClient.invalidateQueries({ queryKey: ['all-trips'] });
      queryClient.invalidateQueries({ queryKey: ['public-trip-templates'] });
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};
