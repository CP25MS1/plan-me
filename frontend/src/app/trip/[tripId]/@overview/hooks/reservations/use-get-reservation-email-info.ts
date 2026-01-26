import { useQuery } from '@tanstack/react-query';
import { getReservationEmailInfo } from '@/api/reservations/api';
import { ReservationEmailInfo } from '@/api/reservations/type';

export const useGetReservationEmailInfo = (tripId: number) => {
  return useQuery<ReservationEmailInfo[], Error>({
    queryKey: ['reservationEmailInfo', tripId],
    queryFn: () => getReservationEmailInfo(tripId),
    enabled: !!tripId,
  });
};
