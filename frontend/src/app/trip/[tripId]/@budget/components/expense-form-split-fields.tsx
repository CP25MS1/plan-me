'use client';

import React from 'react';
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { TripExpenseDto } from '@/api/budget/type';

import type { ExpenseFormApi } from '../hooks/use-expense-form';
import { ParticipantsSplitEditor } from './participants-split-editor';

type Props = {
  form: ExpenseFormApi;
  disableAll: boolean;
  disableSplitMode: boolean;
  onOpenMemberPicker: () => void;
  totalAmount: number;
  initialExpense?: TripExpenseDto | null;
  initialSplits?: Record<number, number>;
  hideSplitModeToggle: boolean;
};

export const ExpenseFormSplitFields: React.FC<Props> = ({
  form,
  disableAll,
  disableSplitMode,
  onOpenMemberPicker,
  totalAmount,
  initialExpense,
  initialSplits,
  hideSplitModeToggle,
}) => {
  const { t } = useTranslation('trip_overview');

  const isEdit = !!initialExpense;
  const initialTotalAmount = React.useMemo(() => {
    if (!isEdit || !initialSplits) return undefined;
    const sum = Object.values(initialSplits).reduce((acc, v) => acc + Number(v ?? 0), 0);
    return +sum.toFixed(2);
  }, [initialSplits, isEdit]);

  return (
    <>
      <Divider sx={{ my: 2.5 }} />

      <Box>
        <Typography sx={{ mb: 1 }}>{t('budget.expenseForm.split.title')}</Typography>

        {!hideSplitModeToggle && (
          <Stack direction="row" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Chip
                label={t('budget.expenseForm.split.noSplit')}
                color={!form.isSplit ? 'success' : 'default'}
                clickable={!disableSplitMode}
                onClick={
                  disableSplitMode
                    ? undefined
                    : () => {
                        form.setSplitMode('NO_SPLIT');
                        form.clearError('splits');
                        form.clearError('form');
                      }
                }
              />

              <Chip
                label={t('budget.expenseForm.split.split')}
                color={form.isSplit ? 'success' : 'default'}
                clickable={!disableSplitMode}
                onClick={
                  disableSplitMode
                    ? undefined
                    : () => {
                        form.setSplitMode('SPLIT');
                        form.clearError('splits');
                        form.clearError('form');
                      }
                }
              />
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {form.isSplit && (
              <Button
                size="small"
                variant="outlined"
                disabled={disableAll}
                onClick={onOpenMemberPicker}
              >
                {t('budget.expenseForm.split.pickMembersCta', {
                  count: form.selectedParticipantIds.length,
                })}
              </Button>
            )}
          </Stack>
        )}

        {form.isSplit && form.errors.splits && (
          <Typography variant="caption" color="error">
            {t(form.errors.splits)}
          </Typography>
        )}

        {!form.isSplit && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2, px: 3, lineHeight: 1.6 }}
          >
            {t('budget.expenseForm.noSplitNote')}
          </Typography>
        )}

        {form.isSplit && (
          <Paper variant="outlined" sx={{ p: 2, mt: 1.5, borderRadius: 3 }}>
            <ParticipantsSplitEditor
              totalAmount={totalAmount}
              participants={form.participantsOrdered}
              payerId={form.payerId}
              onChange={(map) => {
                if (disableAll) return;
                form.setSplitMap(map);
                form.clearError('splits');
                form.clearError('form');
              }}
              initialSplits={isEdit ? initialSplits : undefined}
              initialTotalAmount={initialTotalAmount}
              disabled={disableAll}
              error={form.errors.splits ?? null}
              autoEqualizeOnTotalChange={true}
            />
          </Paper>
        )}
      </Box>
    </>
  );
};

export default ExpenseFormSplitFields;
