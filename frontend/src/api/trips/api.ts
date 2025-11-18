import { apiClient } from '@/api/client';
import { DefaultObjective, UpsertTrip, TripOverview } from './type';

export const getDefaultObjectives = async (): Promise<DefaultObjective[]> => {
  const { data } = await apiClient.get('/trips/objectives');
  return data;
};

export const createTrip = async (tripInfo: UpsertTrip): Promise<TripOverview> => {
  const { data } = await apiClient.post('trips', tripInfo);
  return data;
};
