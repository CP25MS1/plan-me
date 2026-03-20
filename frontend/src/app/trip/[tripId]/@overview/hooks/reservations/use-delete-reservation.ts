import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservation } from '@/api/reservations/api';
import { RESERVATIONS } from '@/constants/query-keys';

export const useDeleteReservation = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => deleteReservation(reservationId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
    },

    onError: (error) => {
      console.error('Delete reservation failed:', error);
    },
  });
};
