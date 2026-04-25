import { useMutation } from '@tanstack/react-query';
import { createChecklistItem } from '@/api/checklist/api';
import { useDispatch } from 'react-redux';
import { addChecklistItem } from '@/store/trip-detail-slice';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useCreateTripChecklist = (tripId: number) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (name: string) => createChecklistItem(tripId, { name }),

    onSuccess: (item) => {
      dispatch(addChecklistItem(item));
      showSuccess(t('notification.success.add_checklist_item'));
    },
    onError: () => {
      showError(t('notification.error.add_checklist_item'));
    },
  });
};
