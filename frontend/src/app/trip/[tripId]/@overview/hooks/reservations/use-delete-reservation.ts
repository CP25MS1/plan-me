import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReservation } from '@/api/reservations/api';

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: number) => deleteReservation(reservationId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },

    onError: (error) => {
      console.error('Delete reservation failed:', error);
    },
  });
};
