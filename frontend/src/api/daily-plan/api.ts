import { CreateScheduledPlaceRequest, ScheduledPlaceDto, UpdateScheduledPlaceRequest, } from './type';
import { apiClient } from '@/api/client';

/** POST /trips/{tripId}/scheduled-places **/
export const createScheduledPlace = async (
  tripId: number,
  payload: CreateScheduledPlaceRequest
) => {
  const { data } = await apiClient.post(`/trips/${tripId}/scheduled-places`, payload);
  return data as ScheduledPlaceDto;
};

/** PUT /trips/{tripId}/scheduled-places/{placeId} **/
export const updateScheduledPlace = async (
  tripId: number,
  placeId: number,
  payload: UpdateScheduledPlaceRequest
) => {
  const { data } = await apiClient.put(`/trips/${tripId}/scheduled-places/${placeId}`, payload);
  return data as ScheduledPlaceDto;
};

/** DELETE /trips/{tripId}/scheduled-places/{placeId} **/
export const deleteScheduledPlace = async (tripId: number, placeId: number) => {
  await apiClient.delete(`/trips/${tripId}/scheduled-places/${placeId}`);
};
