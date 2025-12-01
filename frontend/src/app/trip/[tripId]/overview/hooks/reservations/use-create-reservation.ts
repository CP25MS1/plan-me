import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservation: ReservationDto) => createReservation(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      console.error('Create reservation failed:', error);
    },
  });
};
