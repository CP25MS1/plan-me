import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservation } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reservationId,
      reservation,
    }: {
      reservationId: number;
      reservation: Omit<ReservationDto, 'id'>;
    }) => updateReservation(reservationId, reservation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      console.error('Update reservation failed:', error);
    },
  });
};
