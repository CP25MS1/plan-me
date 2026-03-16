'use client';

import React from 'react';
import { Box, CircularProgress, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { TripOverview } from '@/api/trips';
import type { ExpenseType, TripExpenseDto } from '@/api/budget/type';
import { ConfirmDialog } from '@/components/common/dialog';
import { useI18nSelector } from '@/store/selectors';
import { formatDateByLocale } from '@/lib/date';

import { useGetTripExpenses } from '../hooks/use-get-trip-expenses';
import { useDeleteTripExpense } from '../hooks/use-delete-trip-expense';
import { useExpenseGroups } from '../hooks/use-expense-groups';
import { ExpenseTypeIcon, EXPENSE_TYPE_OPTIONS } from './expense-type-options';
import ExpenseGroupSection from './expense-group-section';
import ExpenseRowCard from './expense-row-card';
import ExpensesEmptyState from './expenses-empty-state';
import { formatCurrency } from '../utils/format-number';
import { getTripDayNumber } from '../utils/trip-day';
import { EditExpenseModal } from './edit-expense-modal';

type Props = {
  tripId: number;
  currentUserId: number;
  tripOverview: TripOverview;
  tab: 'category' | 'day';
  onOpenAddExpense: () => void;
};

export const BudgetExpenseSection: React.FC<Props> = ({
  tripId,
  currentUserId,
  tripOverview,
  tab,
  onOpenAddExpense,
}) => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();

  const expensesQuery = useGetTripExpenses(tripId);
  const deleteMutation = useDeleteTripExpense(tripId);

  const splitExpenses = expensesQuery.data?.split ?? [];

  const [showMineOnly, setShowMineOnly] = React.useState(false);
  const { groups, counts } = useExpenseGroups({
    expenses: splitExpenses,
    tab,
    showMineOnly,
    currentUserId,
  });

  const labelKeyByType = React.useMemo(() => {
    const map = new Map<ExpenseType, string>();
    for (const opt of EXPENSE_TYPE_OPTIONS) map.set(opt.value, opt.labelKey);
    return (type: ExpenseType) => map.get(type);
  }, []);

  const [openByKey, setOpenByKey] = React.useState<Record<string, boolean>>({});
  const isOpen = React.useCallback((key: string) => openByKey[key] ?? true, [openByKey]);
  const toggleGroup = React.useCallback((key: string) => {
    setOpenByKey((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  }, []);

  const [editingExpense, setEditingExpense] = React.useState<TripExpenseDto | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<TripExpenseDto | null>(null);

  const onConfirmDelete = () => {
    if (!pendingDelete) return;

    deleteMutation.mutate(
      { expenseId: pendingDelete.expenseId },
      {
        onSuccess: () => {
          setPendingDelete(null);
          if (editingExpense?.expenseId === pendingDelete.expenseId) {
            setEditingExpense(null);
          }
        },
      }
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>
          {t('budget.expenseList.title')}
        </Typography>

        <FormControlLabel
          sx={{ mr: 0 }}
          control={
            <Switch
              size="small"
              checked={showMineOnly}
              onChange={(_, checked) => setShowMineOnly(checked)}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {t('budget.expenseList.mineOnly')}
            </Typography>
          }
          labelPlacement="start"
        />
      </Stack>

      {expensesQuery.isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : expensesQuery.isError ? (
        <Box sx={{ py: 3 }}>
          <Typography color="error" fontWeight={650}>
            {t('budget.expenseList.error')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expensesQuery.error instanceof Error ? expensesQuery.error.message : ''}
          </Typography>
        </Box>
      ) : groups.length === 0 ? (
        <ExpensesEmptyState
          variant={counts.total === 0 ? 'noExpenses' : 'filteredEmpty'}
          onPrimaryAction={() => {
            if (counts.total === 0) onOpenAddExpense();
            else setShowMineOnly(false);
          }}
          onSecondaryAction={counts.total === 0 ? undefined : onOpenAddExpense}
        />
      ) : (
        <Box sx={{ mt: 1 }}>
          {groups.map((g) => {
            const totalText = formatCurrency(g.total, locale);
            const open = isOpen(g.key);

            const title =
              g.kind === 'category' ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <ExpenseTypeIcon type={g.type} size={18} />
                  <Typography fontWeight={700} noWrap>
                    {t(labelKeyByType(g.type) ?? 'budget.expenseType.other')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    ({g.expenses.length})
                  </Typography>
                </Stack>
              ) : (
                (() => {
                  const tripDay = getTripDayNumber(g.dayKey, tripOverview.startDate, tripOverview.endDate);
                  const dateLabel = formatDateByLocale(g.dayKey, locale);
                  const titleText = tripDay ? t('budget.dayTitle', { day: tripDay, date: dateLabel }) : dateLabel;
                  return (
                    <Typography fontWeight={700} noWrap>
                      {titleText}
                    </Typography>
                  );
                })()
              );

            return (
              <ExpenseGroupSection
                key={g.key}
                title={title}
                total={totalText}
                open={open}
                onToggle={() => toggleGroup(g.key)}
              >
                {g.expenses.map((e) => (
                  <ExpenseRowCard
                    key={e.expenseId}
                    expense={e}
                    locale={locale}
                    canDelete={e.createdBy.id === currentUserId}
                    onClick={() => setEditingExpense(e)}
                    onRequestDelete={() => setPendingDelete(e)}
                  />
                ))}
              </ExpenseGroupSection>
            );
          })}
        </Box>
      )}

      {editingExpense && (
        <EditExpenseModal
          open={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          tripId={tripId}
          currentUserId={currentUserId}
          expense={editingExpense}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => !deleteMutation.isPending && setPendingDelete(null)}
        onConfirm={onConfirmDelete}
        confirmLoading={deleteMutation.isPending}
        color="error"
        content={<Typography>{t('budget.expenseList.deleteConfirm')}</Typography>}
      />
    </>
  );
};

export default BudgetExpenseSection;
