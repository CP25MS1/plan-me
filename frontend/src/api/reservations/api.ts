import { apiClient } from '@/api/client';
import {
  ReservationDto,
  ReservationEmailInfo,
  PreviewReservationRequest,
  ReadEmailInboxRequest,
  ReadEmailInboxResponse,
  ReservationType,
} from './type';
import { GoogleMapPlace } from '@/api/places';

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

/** POST /reservations/bulk */
export const createReservationsBulk = async (
  reservations: ReservationDto[]
): Promise<ReservationDto[]> => {
  const { data } = await apiClient.post('/reservations/bulk', reservations);
  return data;
};

/** POST /email-inbox/read */
export const readEmailInbox = async (
  payload: ReadEmailInboxRequest
): Promise<ReadEmailInboxResponse> => {
  const { data } = await apiClient.post('/email-inbox/read', payload);
  return data;
};

/** POST /reservations/files/preview */
export const getPreviewReservationsFromFiles = async (
  tripId: number,
  types: ReservationType[],
  files: File[]
): Promise<ReservationDto[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const { data } = await apiClient.post('/reservations/files/preview', formData, {
    params: {
      tripId,
      types,
    },
    paramsSerializer: {
      indexes: null,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

/** GET /reservations/places?tripId={tripId} */
export const getAllReservationPlaces = async (tripId: number) => {
  const { data } = await apiClient.get<GoogleMapPlace[]>(`/reservations/places?tripId=${tripId}`);
  return data;
};
