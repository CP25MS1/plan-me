'use client';

import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type {
  CreateTripExpenseRequest,
  ExpenseSplitType,
  TripExpenseDto,
  UpdateTripExpenseRequest,
} from '@/api/budget/type';
import { useI18nSelector } from '@/store/selectors';
import { useGetTripMembers } from '@/app/hooks/use-get-trip-members';

import { useCreateTripExpense } from '../hooks/use-create-trip-expense';
import { useUpdateTripExpense } from '../hooks/use-update-trip-expense';
import { useExpenseForm } from '../hooks/use-expense-form';
import ExpenseFormBasicFields from './expense-form-basic-fields';
import ExpenseFormDialog from './expense-form-dialog';
import ExpenseFormSplitFields from './expense-form-split-fields';
import { MemberPickerModal } from './member-picker-modal';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  onClose: () => void;
  tripId: number;
  currentUserId: number;
  mode: Mode;
  initialExpense?: TripExpenseDto | null;
  readOnly?: boolean;
  defaultSplitMode?: ExpenseSplitType;
  onCreated?: (expense: TripExpenseDto) => void;
};

export const ExpenseFormModal: React.FC<Props> = ({
  open,
  onClose,
  tripId,
  currentUserId,
  mode,
  initialExpense,
  readOnly = false,
  defaultSplitMode,
  onCreated,
}) => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();

  const members = useGetTripMembers(tripId);
  const createMutation = useCreateTripExpense(tripId);
  const updateMutation = useUpdateTripExpense(tripId);

  const form = useExpenseForm({
    open,
    mode,
    currentUserId,
    members,
    initialExpense,
    defaultSplitMode,
  });

  const [memberPickerOpen, setMemberPickerOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) setMemberPickerOpen(false);
  }, [open]);

  const isEdit = mode === 'edit';
  const disableAll = isEdit ? readOnly : false;
  const disablePayer = disableAll || isEdit;
  const disableSplitMode = disableAll || isEdit;
  const disableSpentAt = disableAll || isEdit;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialSplits = React.useMemo(() => {
    if (!initialExpense) return undefined;
    return Object.fromEntries(initialExpense.splits.map((s) => [s.participant.id, Number(s.amount ?? 0)]));
  }, [initialExpense]);

  const handleSubmit = () => {
    if (disableAll) return;

    const nextErrors = form.validateForm();
    if (Object.keys(nextErrors).length > 0) {
      form.setErrors(nextErrors);
      return;
    }

    if (mode === 'create') {
      const payload = form.buildCreatePayload();
      if (!payload) return;

      createMutation.mutate(payload as CreateTripExpenseRequest, {
        onSuccess: (data) => {
          onCreated?.(data);
          onClose();
        },
        onError: () => form.setErrors({ form: 'budget.expenseForm.errors.generic' }),
      });
      return;
    }

    if (!initialExpense) return;
    const payload = form.buildUpdatePayload();
    if (!payload) return;

    updateMutation.mutate(
      { expenseId: initialExpense.expenseId, payload: payload as UpdateTripExpenseRequest },
      {
        onSuccess: () => onClose(),
        onError: () => form.setErrors({ form: 'budget.expenseForm.errors.generic' }),
      }
    );
  };

  const title = t(isEdit ? 'budget.expenseForm.editTitle' : 'budget.expenseForm.createTitle');
  const saveLabel = t(isPending ? 'budget.expenseForm.actions.saving' : 'budget.expenseForm.actions.save');

  const disableSave =
    disableAll ||
    isPending ||
    !form.amountStr.trim() ||
    (form.isSplit && !form.splitComplete);

  return (
    <>
      <ExpenseFormDialog
        open={open}
        title={title}
        isPending={isPending}
        onClose={onClose}
        onSubmit={handleSubmit}
        disableSave={disableSave}
        saveLabel={saveLabel}
      >
        <ExpenseFormBasicFields
          form={form}
          members={members}
          currentUserId={currentUserId}
          locale={locale}
          disableAll={disableAll}
          disablePayer={disablePayer}
          disableSpentAt={disableSpentAt}
        />

        <ExpenseFormSplitFields
          form={form}
          disableAll={disableAll}
          disableSplitMode={disableSplitMode}
          onOpenMemberPicker={() => setMemberPickerOpen(true)}
          totalAmount={Number(form.amountStr || 0)}
          initialExpense={initialExpense}
          initialSplits={initialSplits}
        />

        {form.errors.form && (
          <Typography color="error" sx={{ mt: 1.5 }}>
            {t(form.errors.form)}
          </Typography>
        )}
      </ExpenseFormDialog>

      <MemberPickerModal
        open={memberPickerOpen}
        onClose={() => setMemberPickerOpen(false)}
        members={members}
        payerId={form.payerId}
        selectedIds={form.selectedParticipantIds}
        onConfirm={(ids) => {
          if (disableAll) return;
          form.setSelectedParticipantIds(ids);
          setMemberPickerOpen(false);
          form.clearError('splits');
          form.clearError('form');
        }}
      />
    </>
  );
};

export default ExpenseFormModal;
