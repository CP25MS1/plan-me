'use client';

import React from 'react';

import ExpenseFormModal from './expense-form-modal';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
};

export const AddExpenseModal: React.FC<Props> = ({ open, onClose, tripId, currentUserId }) => {
  return (
    <ExpenseFormModal
      open={open}
      onClose={onClose}
      tripId={tripId}
      currentUserId={currentUserId}
      mode="create"
    />
  );
};

export default AddExpenseModal;

