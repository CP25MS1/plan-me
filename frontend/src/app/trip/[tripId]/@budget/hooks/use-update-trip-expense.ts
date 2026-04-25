import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editExpense } from '@/api/budget/api';
import type { TripExpenseDto, UpdateTripExpenseRequest } from '@/api/budget/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

type Args = {
  expenseId: number;
  payload: UpdateTripExpenseRequest;
};

export const useUpdateTripExpense = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation<TripExpenseDto, Error, Args>({
    mutationKey: ['updateTripExpense', tripId],

    mutationFn: ({ expenseId, payload }) => editExpense(tripId, expenseId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripExpenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripBudget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['tripDebtSummary', tripId] });
      showSuccess(t('notification.success.update'));
    },
    onError: () => {
      showError(t('notification.error.update'));
    },
  });
};

