import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservation } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';
import { RESERVATIONS } from '@/constants/query-keys';

export const useUpdateReservation = (tripId: number) => {
  const queryClient = useQueryClient();

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
    },
    onError: (error) => {
      console.error('Update reservation failed:', error);
    },
  });
};
