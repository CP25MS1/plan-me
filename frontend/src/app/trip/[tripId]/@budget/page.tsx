'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store';
import { isTripOwner } from '../../utils/is-trip-owner';

import { useGetTripOverview } from '../hooks/use-get-trip-overview';
import { useGetTripBudget } from './hooks/use-get-trip-budget';
import { AddExpenseModal } from './components/add-expense-modal';
import { BudgetHeader } from './components/budget-header';
import { BudgetTabs } from './components/budget-tabs';
import { BudgetExpenseSection } from './components/budget-expense-section';
import { FloatingAddButton } from './components/floating-add-button';
import { SetBudgetModal } from './components/set-budget-modal';

const Loading = () => (
  <Box display="flex" justifyContent="center" py={10}>
    <CircularProgress />
  </Box>
);

export default function BudgetPage() {
  const { t } = useTranslation('trip_overview');
  const params = useParams();
  const tripIdParam = params?.tripId;
  const tripId = Number(Array.isArray(tripIdParam) ? tripIdParam[0] : tripIdParam);

  const me = useAppSelector((s) => s.profile.currentUser);

  const { data: tripOverview, isLoading: tripLoading } = useGetTripOverview(tripId);

  const { data: budgetData, isLoading: budgetLoading, isError, error } = useGetTripBudget(tripId);

  const [tab, setTab] = React.useState<'category' | 'day'>('category');
  const [openSetBudget, setOpenSetBudget] = React.useState(false);
  const [openAddExpense, setOpenAddExpense] = React.useState(false);

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

  return (
    <Box>
      <BudgetHeader
        data={budgetData ?? null}
        isOwner={isOwner}
        onOpenSetBudget={() => setOpenSetBudget(true)}
        onEdit={() => setOpenSetBudget(true)}
      />

      <BudgetTabs value={tab} onChange={setTab} />

      <BudgetExpenseSection
        tripId={tripId}
        currentUserId={me.id}
        tripOverview={tripOverview}
        tab={tab}
        onOpenAddExpense={() => setOpenAddExpense(true)}
      />

      <FloatingAddButton onClick={() => setOpenAddExpense(true)} />

      <AddExpenseModal
        open={openAddExpense}
        onClose={() => setOpenAddExpense(false)}
        tripId={tripId}
        currentUserId={me.id}
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
