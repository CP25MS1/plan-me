'use client';

import React from 'react';

import type { TripExpenseDto } from '@/api/budget/type';

import ExpenseFormModal, { type ExpenseFormContext } from './expense-form-modal';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
  expense: TripExpenseDto;
  formContext?: ExpenseFormContext;
};

export const EditExpenseModal: React.FC<Props> = ({
  open,
  onClose,
  tripId,
  currentUserId,
  expense,
  formContext = 'default',
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
      formContext={formContext}
    />
  );
};

export default EditExpenseModal;
