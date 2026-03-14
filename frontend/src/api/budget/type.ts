export interface TripBudgetDto {
  tripId: number;
  budgetConfigured: boolean;
  totalBudget?: number;
  totalExpense: number;
  remainingBudget?: number;
  usagePercentage?: number;
  isOverBudget?: boolean;
  overBudgetAmount?: number;
}

export interface UpdateTripBudgetRequest {
  totalBudget: string;
}
