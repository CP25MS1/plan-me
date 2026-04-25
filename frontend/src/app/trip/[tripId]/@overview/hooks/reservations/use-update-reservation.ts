import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservation } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';
import { RESERVATIONS } from '@/constants/query-keys';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useUpdateReservation = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: ({
      reservationId,
      reservation,
    }: {
      reservationId: number;
      reservation: Omit<ReservationDto, 'id'>;
    }) => updateReservation(reservationId, reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
      showSuccess(t('notification.success.update'));
    },
    onError: (error) => {
      console.error('Update reservation failed:', error);
      showError(t('notification.error.update'));
    },
  });
};
