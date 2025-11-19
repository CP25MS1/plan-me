import { apiClient } from '@/api/client';
import { DefaultObjective, UpsertTrip, TripOverview } from './type';

export const getDefaultObjectives = async (): Promise<DefaultObjective[]> => {
  const { data } = await apiClient.get('/trips/objectives');
  return data;
};

export const createTrip = async (tripInfo: UpsertTrip): Promise<TripOverview> => {
  const { data } = await apiClient.post('/trips', tripInfo);
  return data;
};

export const getTripOverview = async (tripId: number): Promise<TripOverview> => {
  const { data } = await apiClient.get(`/trips/${tripId}/overview`);
  return data;
};

export const updateTripOverview = async (
  tripId: number,
  tripInfo: UpsertTrip
): Promise<TripOverview> => {
  const { data } = await apiClient.patch(`/trips/${tripId}`, tripInfo);
  return data;
};
