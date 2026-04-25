import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservation } from '@/api/reservations/api';
import { RESERVATIONS } from '@/constants/query-keys';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useDeleteReservation = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (reservationId: number) => deleteReservation(reservationId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
      showSuccess(t('notification.success.remove_reservation'));
    },

    onError: (error) => {
      console.error('Delete reservation failed:', error);
      showError(t('notification.error.remove_reservation'));
    },
  });
};
