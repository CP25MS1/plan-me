import type {
  CreateTripExpenseRequest,
  ExpenseSplitType,
  ExpenseType,
  TripExpenseSplitRequest,
  UpdateTripExpenseRequest,
} from '@/api/budget/type';
import type { PublicUserInfo } from '@/api/users/type';

import { computeEqualSplitAmounts } from './split-utils';

export type Mode = 'create' | 'edit';
export type SplitMap = Record<number, number>;

type ErrorKey = 'name' | 'type' | 'amount' | 'payer' | 'spentAt' | 'splits' | 'form';
export type FormErrors = Partial<Record<ErrorKey, string>>;

export const toCents = (n: number) => Math.round(n * 100);

export const safeNumber = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const computeEffectiveSplitMap = ({
  isSplit,
  selectedParticipantIds,
  splitMap,
  totalAmount,
}: {
  isSplit: boolean;
  selectedParticipantIds: number[];
  splitMap: SplitMap;
  totalAmount: number;
}): SplitMap => {
  if (!isSplit || selectedParticipantIds.length === 0) return {};
  const equal = computeEqualSplitAmounts(totalAmount, selectedParticipantIds);
  if (Object.keys(splitMap).length === 0) return equal;
  const out: SplitMap = {};
  for (const id of selectedParticipantIds) out[id] = splitMap[id] ?? equal[id] ?? 0;
  return out;
};

export const computeSplitComplete = ({
  isSplit,
  selectedParticipantIds,
  effectiveSplitMap,
  totalAmount,
}: {
  isSplit: boolean;
  selectedParticipantIds: number[];
  effectiveSplitMap: SplitMap;
  totalAmount: number;
}) => {
  const totalCents = toCents(totalAmount);
  const splitSumCents = isSplit
    ? selectedParticipantIds.reduce((sum, id) => sum + toCents(effectiveSplitMap[id] ?? 0), 0)
    : totalCents;
  return splitSumCents === totalCents;
};

export const validateExpenseForm = ({
  name,
  type,
  amountStr,
  mode,
  spentAtIso,
  payerId,
  members,
  isSplit,
  selectedParticipantIds,
  splitComplete,
}: {
  name: string;
  type: ExpenseType | '';
  amountStr: string;
  mode: Mode;
  spentAtIso: string | null;
  payerId: number;
  members: PublicUserInfo[];
  isSplit: boolean;
  selectedParticipantIds: number[];
  splitComplete: boolean;
}): FormErrors => {
  const next: FormErrors = {};

  if (!name.trim()) next.name = 'budget.expenseForm.errors.requiredName';
  if (!type) next.type = 'budget.expenseForm.errors.requiredType';
  if (!amountStr.trim()) next.amount = 'budget.expenseForm.errors.requiredAmount';
  if (mode === 'create' && !spentAtIso) next.spentAt = 'budget.expenseForm.errors.requiredDate';
  if (!members.some((m) => m.id === payerId)) next.payer = 'budget.expenseForm.errors.invalidPayer';

    if (isSplit) {
      if (selectedParticipantIds.length === 0) next.splits = 'budget.expenseForm.errors.selectParticipants';
      else if (!splitComplete) next.amount = 'budget.expenseForm.errors.amountMismatch';
    }

  return next;
};

export const buildSplitsPayload = ({
  splitMode,
  selectedParticipantIds,
  payerId,
  totalAmount,
  effectiveSplitMap,
}: {
  splitMode: ExpenseSplitType;
  selectedParticipantIds: number[];
  payerId: number;
  totalAmount: number;
  effectiveSplitMap: SplitMap;
}): TripExpenseSplitRequest[] => {
  const isSplit = splitMode === 'SPLIT';
  if (!isSplit) return [{ participantUserId: payerId, amount: totalAmount }];

  return selectedParticipantIds.map((id) => ({
    participantUserId: id,
    amount: effectiveSplitMap[id] ?? 0,
  }));
};

export const buildCreatePayload = ({
  name,
  type,
  payerId,
  spentAtIso,
  splitMode,
  selectedParticipantIds,
  totalAmount,
  effectiveSplitMap,
}: {
  name: string;
  type: ExpenseType | '';
  payerId: number;
  spentAtIso: string | null;
  splitMode: ExpenseSplitType;
  selectedParticipantIds: number[];
  totalAmount: number;
  effectiveSplitMap: SplitMap;
}): CreateTripExpenseRequest | null => {
  if (!spentAtIso || !type) return null;
  return {
    name,
    type,
    payerUserId: payerId,
    spentAt: spentAtIso,
    splits: buildSplitsPayload({ splitMode, selectedParticipantIds, payerId, totalAmount, effectiveSplitMap }),
  };
};

export const buildUpdatePayload = ({
  name,
  type,
  payerId,
  splitMode,
  selectedParticipantIds,
  totalAmount,
  effectiveSplitMap,
}: {
  name: string;
  type: ExpenseType | '';
  payerId: number;
  splitMode: ExpenseSplitType;
  selectedParticipantIds: number[];
  totalAmount: number;
  effectiveSplitMap: SplitMap;
}): UpdateTripExpenseRequest | null => {
  if (!type) return null;
  return {
    name,
    type,
    payerUserId: payerId,
    splits: buildSplitsPayload({ splitMode, selectedParticipantIds, payerId, totalAmount, effectiveSplitMap }),
  };
};

