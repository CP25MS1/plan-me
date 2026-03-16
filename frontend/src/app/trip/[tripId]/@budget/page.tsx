'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

import { useAppSelector } from '@/store';
import { isTripOwner } from '../../utils/is-trip-owner';

import { useGetTripOverview } from '../hooks/use-get-trip-overview';
import { useGetTripBudget } from './hooks/use-get-trip-budget';
import { AddExpenseModal } from './components/add-expense-modal';
import { BudgetHeader } from './components/budget-header';
import { BudgetTabs } from './components/budget-tabs';
import { FloatingAddButton } from './components/floating-add-button';
import { SetBudgetModal } from './components/set-budget-modal';

const Loading = () => (
  <Box display="flex" justifyContent="center" py={10}>
    <CircularProgress />
  </Box>
);

export default function BudgetPage() {
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
    return <Typography color="error">TripId ไม่ถูกต้อง</Typography>;
  }

  if (tripLoading || budgetLoading || !me) return <Loading />;

  if (isError) {
    return <Typography color="error">{(error as Error)?.message}</Typography>;
  }

  const isOwner = isTripOwner(me, tripOverview);

  return (
    <Container maxWidth="md">
      <BudgetHeader
        data={budgetData ?? null}
        isOwner={isOwner}
        onOpenSetBudget={() => setOpenSetBudget(true)}
        onEdit={() => setOpenSetBudget(true)}
      />

      <BudgetTabs value={tab} onChange={setTab} />

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
    </Container>
  );
}
