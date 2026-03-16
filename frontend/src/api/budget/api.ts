import { apiClient } from '@/api/client';
import {
  CreateTripExpenseRequest,
  TripBudgetDto,
  TripExpenseDto,
  TripExpenseListDto,
  UpdateTripBudgetRequest,
  UpdateTripExpenseRequest,
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

export const getTripExpenses = async (tripId: number) => {
  const { data } = await apiClient.get<TripExpenseListDto>(`/trips/${tripId}/expenses`);
  return data;
};

export const editExpense = async (
  tripId: number,
  expenseId: number,
  payload: UpdateTripExpenseRequest
) => {
  const { data } = await apiClient.put(`/trips/${tripId}/expenses/${expenseId}`, payload);
  return data as TripExpenseDto;
};

export const deleteExpense = async (tripId: number, expenseId: number) => {
  await apiClient.delete(`/trips/${tripId}/expenses/${expenseId}`);
};
