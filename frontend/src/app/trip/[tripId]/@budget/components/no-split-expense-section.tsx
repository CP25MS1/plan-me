'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { TripOverview } from '@/api/trips';
import type { ExpenseType, TripExpenseDto } from '@/api/budget/type';
import { ConfirmDialog } from '@/components/common/dialog';
import { useI18nSelector } from '@/store/selectors';
import { formatDateByLocale } from '@/lib/date';

import { useGetTripExpenses } from '../hooks/use-get-trip-expenses';
import { useDeleteTripExpense } from '../hooks/use-delete-trip-expense';
import { useExpenseGroups } from '../hooks/use-expense-groups';
import { EXPENSE_TYPE_OPTIONS, ExpenseTypeIcon } from './expense-type-options';
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
  onRequestAddNoSplit: () => void;
};

export const NoSplitExpenseSection: React.FC<Props> = ({
  tripId,
  currentUserId,
  tripOverview,
  tab,
  onRequestAddNoSplit,
}) => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();

  const expensesQuery = useGetTripExpenses(tripId);
  const deleteMutation = useDeleteTripExpense(tripId);

  const noSplitExpenses = expensesQuery.data?.noSplit ?? [];

  const { groups } = useExpenseGroups({
    expenses: noSplitExpenses,
    tab,
    showMineOnly: false,
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

  if (expensesQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (expensesQuery.isError) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography color="error" fontWeight={650}>
          {t('budget.personalExpenses.error')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {expensesQuery.error instanceof Error ? expensesQuery.error.message : ''}
        </Typography>
      </Box>
    );
  }

  if (groups.length === 0) {
    return <ExpensesEmptyState variant="noPersonalExpenses" onPrimaryAction={onRequestAddNoSplit} />;
  }

  return (
    <>
      <Box>
        {groups.map((g) => {
          const totalText = formatCurrency(g.total, locale);
          const open = isOpen(g.key);

          const title =
            g.kind === 'category' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <ExpenseTypeIcon type={g.type} size={18} />
                <Typography fontWeight={700} noWrap>
                  {t(labelKeyByType(g.type) ?? 'budget.expenseType.other')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  ({g.expenses.length})
                </Typography>
              </Box>
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

export default NoSplitExpenseSection;

