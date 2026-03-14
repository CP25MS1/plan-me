import { apiClient } from '@/api/client';
import { TripBudgetDto, UpdateTripBudgetRequest } from './type';

export const getTripBudgetSummary = async (tripId: number): Promise<TripBudgetDto> => {
  const { data } = await apiClient.get(`/trips/${tripId}/budget`);
  return data;
};

export const updateTripBudget = async (
  tripId: number,
  payload: UpdateTripBudgetRequest
): Promise<TripBudgetDto> => {
  const { data } = await apiClient.put(`/trips/${tripId}/budget`, payload);
  return data;
};
