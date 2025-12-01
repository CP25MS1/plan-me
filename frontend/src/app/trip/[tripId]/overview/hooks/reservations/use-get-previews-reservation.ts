import { useMutation } from '@tanstack/react-query';
import { getPreviewsReservation } from '@/api/reservations/api';
import { PreviewReservationRequest, ReservationDto } from '@/api/reservations/type';

interface Params {
  tripId: number;
  emails: PreviewReservationRequest[];
}

export const useGetPreviewsReservation = () => {
  return useMutation<ReservationDto[], Error, Params>({
    mutationFn: ({ tripId, emails }) => getPreviewsReservation(tripId, emails),
    onError: (error) => {
      console.error('Fetch previews reservation failed:', error);
    },
  });
};
