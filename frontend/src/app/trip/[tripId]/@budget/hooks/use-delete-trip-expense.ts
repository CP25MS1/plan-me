import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExpense } from '@/api/budget/api';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

type Args = {
  expenseId: number;
};

export const useDeleteTripExpense = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation<void, Error, Args>({
    mutationKey: ['deleteTripExpense', tripId],

    mutationFn: ({ expenseId }) => deleteExpense(tripId, expenseId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripExpenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripBudget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripDebtSummary', tripId] });
      showSuccess(t('notification.success.remove_expense'));
    },
    onError: () => {
      showError(t('notification.error.remove_expense'));
    },
  });
};

