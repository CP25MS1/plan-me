'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store';
import { isTripOwner } from '../../utils/is-trip-owner';
import type { ExpenseSplitType, TripExpenseDto } from '@/api/budget/type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';

import { useGetTripOverview } from '../hooks/use-get-trip-overview';
import { useGetTripBudget } from './hooks/use-get-trip-budget';
import { AddExpenseModal } from './components/add-expense-modal';
import { BudgetHeader } from './components/budget-header';
import { BudgetQuickActions } from './components/budget-quick-actions';
import { BudgetTabs } from './components/budget-tabs';
import { BudgetExpenseSection } from './components/budget-expense-section';
import { FloatingAddButton } from './components/floating-add-button';
import { NoSplitExpensesDialog } from './components/no-split-expenses-dialog';
import { SetBudgetModal } from './components/set-budget-modal';

const Loading = () => (
  <Box display="flex" justifyContent="center" py={10}>
    <CircularProgress />
  </Box>
);

export default function BudgetPage() {
  const { t } = useTranslation('trip_overview');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tripIdParam = params?.tripId;
  const tripId = Number(Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam);

  const me = useAppSelector((s) => s.profile.currentUser);

  const { data: tripOverview, isLoading: tripLoading } = useGetTripOverview(tripId);

  const { data: budgetData, isLoading: budgetLoading, isError, error } = useGetTripBudget(tripId);

  const { showSnackbar } = useSnackbar();
  const [tab, setTab] = React.useState<'category' | 'day'>('category');
  const [openSetBudget, setOpenSetBudget] = React.useState(false);
  const [openAddExpense, setOpenAddExpense] = React.useState(false);
  const [addDefaultSplitMode, setAddDefaultSplitMode] = React.useState<
    ExpenseSplitType | undefined
  >(undefined);
  const [addFormContext, setAddFormContext] = React.useState<'default' | 'personal'>('default');
  const [hasNewNoSplit, setHasNewNoSplit] = React.useState(false);
  const [pendingOpenNoSplitCreate, setPendingOpenNoSplitCreate] = React.useState(false);

  const dialogKey = searchParams.get('budgetDialog');
  const noSplitDialogOpen = dialogKey === 'noSplit';

  React.useEffect(() => {
    if (!noSplitDialogOpen && pendingOpenNoSplitCreate) {
      setAddFormContext('personal');
      setAddDefaultSplitMode('NO_SPLIT');
      setOpenAddExpense(true);
      setPendingOpenNoSplitCreate(false);
    }
  }, [noSplitDialogOpen, pendingOpenNoSplitCreate]);

  if (!Number.isFinite(tripId) || tripId <= 0) {
    return <Typography color="error">{t('budget.errors.invalidTripId')}</Typography>;
  }

  if (tripLoading || budgetLoading || !me || !tripOverview) return <Loading />;

  if (isError) {
    return (
      <Typography color="error">
        {t('budget.errors.loadBudget')} {error instanceof Error ? `(${error.message})` : ''}
      </Typography>
    );
  }

  const isOwner = isTripOwner(me, tripOverview);

  const openNoSplitDialog = () => {
    setHasNewNoSplit(false);

    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', 'budget');
    next.set('budgetDialog', 'noSplit');
    router.push(`?${next.toString()}`, { scroll: false });
  };

  const closeNoSplitDialog = () => {
    router.back();
  };

  const openAddSplitExpense = () => {
    setAddFormContext('default');
    setAddDefaultSplitMode(undefined);
    setOpenAddExpense(true);
  };

  const openAddNoSplitExpense = () => {
    setAddFormContext('personal');
    setAddDefaultSplitMode('NO_SPLIT');
    setOpenAddExpense(true);
  };

  const onExpenseCreated = (expense: TripExpenseDto) => {
    if (expense.splitType === 'NO_SPLIT') {
      setHasNewNoSplit(true);
      showSnackbar({
        message: t('budget.snackbar.noSplitCreated'),
        severity: 'info',
        actionLabel: t('budget.snackbar.viewPersonal'),
        onAction: openNoSplitDialog,
      });
    }
  };

  return (
    <Box>
      <BudgetHeader
        data={budgetData ?? null}
        isOwner={isOwner}
        onOpenSetBudget={() => setOpenSetBudget(true)}
        onEdit={() => setOpenSetBudget(true)}
      />

      <BudgetQuickActions
        tripId={tripId}
        currentUserId={me.id}
        hasNewNoSplit={hasNewNoSplit}
        onOpenNoSplitDialog={openNoSplitDialog}
        onOpenDebtSummary={() => router.push(`/debts/${tripId}`)}
      />

      <BudgetTabs value={tab} onChange={setTab} />

      <BudgetExpenseSection
        tripId={tripId}
        currentUserId={me.id}
        tripOverview={tripOverview}
        tab={tab}
        onOpenAddExpense={openAddSplitExpense}
      />

      <FloatingAddButton
        onClick={noSplitDialogOpen ? openAddNoSplitExpense : openAddSplitExpense}
      />

      <AddExpenseModal
        open={openAddExpense}
        onClose={() => {
          setOpenAddExpense(false);
          setAddDefaultSplitMode(undefined);
          setAddFormContext('default');
        }}
        tripId={tripId}
        currentUserId={me.id}
        defaultSplitMode={addDefaultSplitMode}
        formContext={addFormContext}
        onCreated={onExpenseCreated}
      />

      <NoSplitExpensesDialog
        open={noSplitDialogOpen}
        onClose={closeNoSplitDialog}
        tripId={tripId}
        currentUserId={me.id}
        tripOverview={tripOverview}
        onRequestAddNoSplit={() => {
          setPendingOpenNoSplitCreate(true);
          closeNoSplitDialog();
        }}
      />

      <SetBudgetModal
        open={openSetBudget}
        onClose={() => setOpenSetBudget(false)}
        tripId={tripId}
        current={budgetData ?? null}
        isOwner={isOwner}
      />

    </Box>
  );
}
