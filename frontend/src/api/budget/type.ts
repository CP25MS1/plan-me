import { PublicUserInfo } from '@/api/users';

export type ExpenseType = 'TRAVEL' | 'LODGING' | 'FOOD' | 'ACTIVITY' | 'SHOPPING' | 'OTHER';

export type ExpenseSplitType = 'SPLIT' | 'NO_SPLIT';

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

export interface CreateTripExpenseRequest {
  name: string;
  type: ExpenseType;
  payerUserId: number;
  spentAt: string;
  splits: CreateExpenseSplitRequest[];
}

export interface CreateExpenseSplitRequest {
  participantUserId: number;
  amount: number;
}

export interface ExpenseSplitDto {
  participant: PublicUserInfo;
  amount: number;
}

export interface TripExpenseDto {
  expenseId: number;
  tripId: number;
  name: string;
  type: ExpenseType;
  splitType: ExpenseSplitType;
  payer: PublicUserInfo;
  createdBy: PublicUserInfo;
  spentAt: string;
  splits: ExpenseSplitDto[];
}
