import { useMutation } from '@tanstack/react-query';
import { getPreviewReservationsFromFiles } from '@/api/reservations/api';
import { ReservationDto, ReservationType } from '@/api/reservations/type';

interface Params {
  tripId: number;
  types: ReservationType[];
  files: File[];
}

export const useGetPreviewReservationsFromFiles = () => {
  return useMutation<ReservationDto[], Error, Params>({
    mutationFn: ({ tripId, types, files }) => getPreviewReservationsFromFiles(tripId, types, files),
  });
};
