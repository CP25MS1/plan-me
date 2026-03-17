import React from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from '@/lib/dayjs';
import type { ExpenseSplitType, ExpenseType, TripExpenseDto } from '@/api/budget/type';
import type { PublicUserInfo } from '@/api/users/type';
import { getExpenseTotal } from '../utils/expense-money';
import {
  buildCreatePayload,
  buildUpdatePayload,
  computeEffectiveSplitMap,
  computeSplitComplete,
  safeNumber,
  validateExpenseForm,
  type FormErrors,
  type Mode,
  type SplitMap,
} from '../utils/expense-form-helpers';
type ErrorKey = keyof FormErrors;

export const useExpenseForm = ({
  open,
  mode,
  currentUserId,
  members,
  initialExpense,
  defaultSplitMode,
  formContext = 'default',
}: {
  open: boolean;
  mode: Mode;
  currentUserId: number;
  members: PublicUserInfo[];
  initialExpense?: TripExpenseDto | null;
  defaultSplitMode?: ExpenseSplitType;
  formContext?: 'default' | 'personal';
}) => {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<ExpenseType | ''>('');
  const [amountStr, setAmountStr] = React.useState('');
  const [spentAt, setSpentAt] = React.useState<Dayjs | null>(dayjs());
  const [payerId, setPayerIdState] = React.useState(currentUserId);
  const [splitMode, setSplitModeState] = React.useState<ExpenseSplitType>('SPLIT');
  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState<number[]>([]);
  const [splitMap, setSplitMap] = React.useState<SplitMap>({});
  const [errors, setErrors] = React.useState<FormErrors>({});
  const setPayerId = React.useCallback((next: number) => {
    if (mode === 'create' && splitMode === 'NO_SPLIT') setPayerIdState(currentUserId);
    else setPayerIdState(next);
  }, [currentUserId, mode, splitMode]);
  const setSplitMode = React.useCallback((next: ExpenseSplitType) => {
    if (mode === 'edit') return;
    if (mode === 'create' && formContext === 'personal') return;
    setSplitModeState(next);
    if (mode === 'create' && next === 'NO_SPLIT') setPayerIdState(currentUserId);
  }, [currentUserId, formContext, mode]);

  const clearError = React.useCallback((key: ErrorKey) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const resetForm = React.useCallback((userId: number, nextSplitMode: ExpenseSplitType) => {
    setName('');
    setType('');
    setAmountStr('');
    setSpentAt(dayjs());
    setPayerIdState(userId);
    setSplitModeState(nextSplitMode);
    setSelectedParticipantIds([]);
    setSplitMap({});
    setErrors({});
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialExpense) {
      setName(initialExpense.name ?? '');
      setType(initialExpense.type ?? '');
      setPayerIdState(initialExpense.payer.id);
      setSpentAt(dayjs(initialExpense.spentAt));
      setSplitModeState(initialExpense.splitType);
      const ids = initialExpense.splits.map((s) => s.participant.id);
      setSelectedParticipantIds(ids);
      const initTotal = getExpenseTotal(initialExpense);
      setAmountStr(initTotal ? initTotal.toFixed(2) : '');
      const initMap: SplitMap = {};
      for (const s of initialExpense.splits) initMap[s.participant.id] = Number(s.amount ?? 0);
      setSplitMap(initMap);
      setErrors({});
      return;
    }
    const nextMode: ExpenseSplitType = mode === 'create' && formContext === 'personal' ? 'NO_SPLIT' : (defaultSplitMode ?? 'SPLIT');
    resetForm(currentUserId, nextMode);
  }, [currentUserId, defaultSplitMode, formContext, initialExpense, mode, open, resetForm]);

  React.useEffect(() => {
    if (mode !== 'create') return;
    if (splitMode !== 'NO_SPLIT') return;
    if (payerId === currentUserId) return;
    setPayerIdState(currentUserId);
  }, [currentUserId, mode, payerId, splitMode]);

  const memberById = React.useMemo(() => new Map(members.map((m) => [m.id, m] as const)), [members]);
  const participantsOrdered = React.useMemo<PublicUserInfo[]>(
    () => selectedParticipantIds.map((id) => memberById.get(id) ?? { id, username: '', email: '', profilePicUrl: '' }),
    [memberById, selectedParticipantIds]
  );

  const totalAmount = safeNumber(amountStr);
  const isSplit = splitMode === 'SPLIT';
  const effectiveSplitMap = React.useMemo<SplitMap>(
    () => computeEffectiveSplitMap({ isSplit, selectedParticipantIds, splitMap, totalAmount }),
    [isSplit, selectedParticipantIds, splitMap, totalAmount]
  );
  const splitComplete = React.useMemo(
    () => computeSplitComplete({ isSplit, selectedParticipantIds, effectiveSplitMap, totalAmount }),
    [effectiveSplitMap, isSplit, selectedParticipantIds, totalAmount]
  );

  const spentAtIso = spentAt?.toISOString() ?? null;
  const validateForm = () =>
    validateExpenseForm({ name, type, amountStr, mode, spentAtIso, payerId, members, isSplit, selectedParticipantIds, splitComplete });
  const buildCreate = () =>
    buildCreatePayload({ name, type, payerId, spentAtIso, splitMode, selectedParticipantIds, totalAmount, effectiveSplitMap });
  const buildUpdate = () =>
    buildUpdatePayload({ name, type, payerId, splitMode, selectedParticipantIds, totalAmount, effectiveSplitMap });

  return {
    name, setName,
    type, setType,
    amountStr, setAmountStr,
    spentAt, setSpentAt,
    payerId, setPayerId,
    splitMode, setSplitMode,
    selectedParticipantIds, setSelectedParticipantIds,
    splitMap, setSplitMap,
    effectiveSplitMap, participantsOrdered,
    isSplit, splitComplete,
    errors, setErrors,
    clearError, validateForm,
    buildCreatePayload: buildCreate,
    buildUpdatePayload: buildUpdate,
  };
};

export type ExpenseFormApi = ReturnType<typeof useExpenseForm>;
export type { FormErrors, Mode, SplitMap } from '../utils/expense-form-helpers';
