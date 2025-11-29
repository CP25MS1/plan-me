import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservation: Omit<ReservationDto, 'id'>) => createReservation(reservation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      console.log('Reservation created:', data);
    },
    onError: (error) => {
      console.error('Create reservation failed:', error);
    },
  });
};
