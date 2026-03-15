import { PublicUserInfo } from '../users';

export type MyDebtSummaryResponse = {
  tripId: number;
  full: DebtSummarySection;
  net: DebtSummarySection;
};

export type DebtSummarySection = {
  owedToMe: DebtItem;
  iOwed: DebtItem;
};

export type DebtItem = {
  user: PublicUserInfo;
  amount: number;
};
