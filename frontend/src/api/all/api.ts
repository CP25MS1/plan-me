import { apiClient } from '@/api/client';
import { TripOverview } from '@/api/trips/type';

export const getAllTrips = async (): Promise<TripOverview[]> => {
  const { data } = await apiClient.get('/trips/me');
  return data;
};
