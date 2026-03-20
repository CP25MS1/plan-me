import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';
import { RESERVATIONS } from '@/constants/query-keys';

export const useCreateReservation = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservation: ReservationDto) => createReservation(reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
    },
    onError: (error) => {
      console.error('Create reservation failed:', error);
    },
  });
};
