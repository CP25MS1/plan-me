import { apiClient } from '@/api/client';
import {
  TripBudgetDto,
  UpdateTripBudgetRequest,
  CreateTripExpenseRequest,
  TripExpenseDto,
} from './type';

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

export const createTripExpense = async (
  tripId: number,
  payload: CreateTripExpenseRequest
): Promise<TripExpenseDto> => {
  const { data } = await apiClient.post(`/trips/${tripId}/expenses`, payload);
  return data;
};

