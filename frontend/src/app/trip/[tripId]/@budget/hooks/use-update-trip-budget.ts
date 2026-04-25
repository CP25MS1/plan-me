import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripBudget } from '@/api/budget/api';
import { UpdateTripBudgetRequest, TripBudgetDto } from '@/api/budget/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useUpsertTripBudget = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (payload: UpdateTripBudgetRequest) => updateTripBudget(tripId, payload),

    onSuccess: (data: TripBudgetDto) => {
      queryClient.setQueryData(['tripBudget', tripId], data);
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};
