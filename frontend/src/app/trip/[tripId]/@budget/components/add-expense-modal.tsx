'use client';

import React from 'react';

import type { ExpenseSplitType, TripExpenseDto } from '@/api/budget/type';

import ExpenseFormModal from './expense-form-modal';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
  defaultSplitMode?: ExpenseSplitType;
  onCreated?: (expense: TripExpenseDto) => void;
};

export const AddExpenseModal: React.FC<Props> = ({
  open,
  onClose,
  tripId,
  currentUserId,
  defaultSplitMode,
  onCreated,
}) => {
  return (
    <ExpenseFormModal
      open={open}
      onClose={onClose}
      tripId={tripId}
      currentUserId={currentUserId}
      mode="create"
      defaultSplitMode={defaultSplitMode}
      onCreated={onCreated}
    />
  );
};

export default AddExpenseModal;
