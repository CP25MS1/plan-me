import { useMutation } from '@tanstack/react-query';
import { createReservationsBulk } from '@/api/reservations/api';
import { ReservationDto } from '@/api/reservations/type';
import { useDispatch } from 'react-redux';
import { addReservation } from '@/store/trip-detail-slice';

export const useCreateReservationBulk = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (reservations: ReservationDto[]) =>
      createReservationsBulk(reservations),
    onSuccess: (data) => {
      data.forEach((rs) => dispatch(addReservation(rs)));
    },
  });
};
