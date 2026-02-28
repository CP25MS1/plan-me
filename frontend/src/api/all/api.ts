import { apiClient } from '@/api/client';
import { TripSummary } from './type';

export const getAllTrips = async (): Promise<TripSummary[]> => {
  const { data } = await apiClient.get('/trips/me');
  return data;
};
