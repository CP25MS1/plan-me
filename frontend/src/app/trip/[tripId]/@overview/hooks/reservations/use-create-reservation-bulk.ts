import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservationsBulk } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';
import { RESERVATIONS } from '@/constants/query-keys';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useCreateReservationBulk = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (reservations: ReservationDto[]) => createReservationsBulk(reservations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
      showSuccess(t('notification.success.add_reservation'));
    },
    onError: () => {
      showError(t('notification.error.add_reservation'));
    },
  });
};
