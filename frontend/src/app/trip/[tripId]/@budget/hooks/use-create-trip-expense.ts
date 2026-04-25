import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTripExpense } from '@/api/budget/api';
import { CreateTripExpenseRequest, TripExpenseDto } from '@/api/budget/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useCreateTripExpense = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation<TripExpenseDto, Error, CreateTripExpenseRequest>({
    mutationKey: ['createTripExpense', tripId],

    mutationFn: (payload) => createTripExpense(tripId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tripExpenses', tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tripBudget', tripId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tripDebtSummary', tripId],
      });

      showSuccess(t('notification.success.add_expense'));
    },
    onError: () => {
      showError(t('notification.error.add_expense'));
    },
  });
};
