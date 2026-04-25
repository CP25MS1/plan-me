import { useMutation } from '@tanstack/react-query';
import { deleteChecklistItem } from '@/api/checklist/api';
import { useDispatch } from 'react-redux';
import { removeChecklistItem } from '@/store/trip-detail-slice';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useDeleteTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (itemId: number) => deleteChecklistItem(tripId, itemId),

    onSuccess: (_, itemId) => {
      dispatch(removeChecklistItem(itemId));
      showSuccess(t('notification.success.remove_checklist_item'));
    },
    onError: () => {
      showError(t('notification.error.remove_checklist_item'));
    },
  });
};
