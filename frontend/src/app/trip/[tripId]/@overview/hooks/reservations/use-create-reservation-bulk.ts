import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservationsBulk } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';
import { RESERVATIONS } from '@/constants/query-keys';

export const useCreateReservationBulk = (tripId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservations: ReservationDto[]) => createReservationsBulk(reservations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripId] });
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS.PLACES, tripId] });
    },
  });
};
