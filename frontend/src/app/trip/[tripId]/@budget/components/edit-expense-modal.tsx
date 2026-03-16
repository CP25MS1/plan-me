'use client';

import React from 'react';

import type { TripExpenseDto } from '@/api/budget/type';

import ExpenseFormModal from './expense-form-modal';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
  expense: TripExpenseDto;
};

export const EditExpenseModal: React.FC<Props> = ({
  open,
  onClose,
  tripId,
  currentUserId,
  expense,
}) => {
  const readOnly = expense.createdBy.id !== currentUserId;

  return (
    <ExpenseFormModal
      open={open}
      onClose={onClose}
      tripId={tripId}
      currentUserId={currentUserId}
      mode="edit"
      initialExpense={expense}
      readOnly={readOnly}
    />
  );
};

export default EditExpenseModal;

