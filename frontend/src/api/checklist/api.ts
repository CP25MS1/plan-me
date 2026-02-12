import { apiClient } from '@/api/client';
import { TripChecklistDto, CreateTripChecklistRequest, UpdateTripChecklistRequest } from './type';

export const getChecklistItems = async (tripId: number): Promise<TripChecklistDto[]> => {
  const { data } = await apiClient.get(`/trips/${tripId}/checklist-items`);
  return data;
};

export const createChecklistItem = async (
  tripId: number,
  payload: CreateTripChecklistRequest
): Promise<TripChecklistDto> => {
  const { data } = await apiClient.post(`/trips/${tripId}/checklist-items`, payload);
  return data;
};

export const updateChecklistItem = async (
  tripId: number,
  itemId: string,
  payload: UpdateTripChecklistRequest
): Promise<TripChecklistDto> => {
  const { data } = await apiClient.patch(`/trips/${tripId}/checklist-items/${itemId}`, payload);
  return data;
};

export const deleteChecklistItem = async (tripId: number, itemId: string): Promise<void> => {
  await apiClient.delete(`/trips/${tripId}/checklist-items/${itemId}`);
};
