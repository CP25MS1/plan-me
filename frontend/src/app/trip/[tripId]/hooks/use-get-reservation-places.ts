import { useQuery } from '@tanstack/react-query';

import { RESERVATIONS } from '@/constants/query-keys';
import { getAllReservationPlaces } from '@/api/reservations';

export const useGetReservationPlaces = (tripId: number) => {
  return useQuery({
    queryKey: [RESERVATIONS.PLACES, tripId],
    queryFn: () => getAllReservationPlaces(tripId),
    enabled: tripId > 0,
  });
};
