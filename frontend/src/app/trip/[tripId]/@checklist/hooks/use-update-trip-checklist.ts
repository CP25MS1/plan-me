import { useMutation } from '@tanstack/react-query';
import { updateChecklistItem } from '@/api/checklist/api';
import { useDispatch } from 'react-redux';
import { updateChecklistItem as updateChecklistInStore } from '@/store/trip-detail-slice';
import { UpdateTripChecklistRequest, TripChecklistDto } from '@/api/checklist/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

type UpdateVars = {
  itemId: number;
  payload: UpdateTripChecklistRequest;
};

export const useUpdateTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation<TripChecklistDto, Error, UpdateVars>({
    mutationFn: ({ itemId, payload }) => updateChecklistItem(tripId, itemId, payload),

    onSuccess: (item) => {
      dispatch(updateChecklistInStore(item));
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};
