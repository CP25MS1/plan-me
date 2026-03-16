import { PublicUserInfo } from '@/api/users';

export type ExpenseType = 'TRAVEL' | 'LODGING' | 'FOOD' | 'ACTIVITY' | 'SHOPPING' | 'OTHER';

export type ExpenseSplitType = 'SPLIT' | 'NO_SPLIT';

export type TripBudgetDto = {
  tripId: number;
  budgetConfigured: boolean;
  totalBudget?: number;
  totalExpense: number;
  remainingBudget?: number;
  usagePercentage?: number;
  isOverBudget?: boolean;
  overBudgetAmount?: number;
};

export type UpdateTripBudgetRequest = {
  totalBudget: string;
};

export type TripExpenseSplitRequest = {
  participantUserId: number;
  amount: number;
};

export type CreateTripExpenseRequest = {
  name: string;
  type: ExpenseType;
  payerUserId: number;
  spentAt: string;
  splits: TripExpenseSplitRequest[];
};

export type UpdateTripExpenseRequest = {
  name: string;
  type: ExpenseType;
  payerUserId: number;
  splits: TripExpenseSplitRequest[];
};

export type ExpenseSplitDto = {
  participant: PublicUserInfo;
  amount: number;
};

export type TripExpenseDto = {
  expenseId: number;
  tripId: number;
  name: string;
  type: ExpenseType;
  splitType: ExpenseSplitType;
  payer: PublicUserInfo;
  createdBy: PublicUserInfo;
  spentAt: string;
  splits: ExpenseSplitDto[];
};

export type TripExpenseListDto = {
  split: TripExpenseDto[];
  noSplit: TripExpenseDto[];
};
