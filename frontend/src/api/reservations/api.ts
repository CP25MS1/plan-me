import { apiClient } from '@/api/client';
import { ReservationDto, ReservationEmailInfo, PreviewReservationRequest } from './type';

/** Create a reservation */
export const createReservation = async (
  reservation: Omit<ReservationDto, 'id'>
): Promise<ReservationDto> => {
  const { data } = await apiClient.post('/reservations', reservation);
  return data;
};

/** Update an existing reservation */
export const updateReservation = async (
  reservationId: number,
  reservation: Omit<ReservationDto, 'id'>
): Promise<ReservationDto> => {
  const { data } = await apiClient.put(`/reservations/${reservationId}`, reservation);
  return data;
};

/** Delete an existing reservation */
export const deleteReservation = async (reservationId: number): Promise<void> => {
  await apiClient.delete(`/reservations/${reservationId}`);
};

/** GET /reservations/emails/check-info */
export const getReservationEmailInfo = async (tripId: number): Promise<ReservationEmailInfo[]> => {
  const { data } = await apiClient.get('/reservations/emails/check-info', {
    params: { tripId },
  });
  return data;
};

/** POST /reservations/emails/preview */
export const getPreviewsReservation = async (
  tripId: number,
  emails: PreviewReservationRequest[]
): Promise<ReservationDto[]> => {
  const { data } = await apiClient.post('/reservations/emails/preview', emails, {
    params: { tripId },
  });
  return data;
};
