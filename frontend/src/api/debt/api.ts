import { apiClient } from '../client';
import { MyDebtSummaryResponse } from './type';

export const getMyDebtSummary = async (tripId: number): Promise<MyDebtSummaryResponse> => {
  const { data } = await apiClient.get<MyDebtSummaryResponse>(`/trips/${tripId}/debts/me`);
  return data;
};
