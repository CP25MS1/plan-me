'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Box, Typography, CircularProgress } from '@mui/material';

import { useAppSelector } from '@/store';
import { isTripOwner } from './utils/is-trip-owner';

import { useGetTripOverview } from '../hooks/use-get-trip-overview';
import { useGetTripBudget } from './hooks/use-get-trip-budget';

import { BudgetHeader } from './components/budget-header';
import { BudgetTabs } from './components/budget-tabs';
import { CategoryList } from './components/category-list';
import { FloatingAddButton } from './components/floating-add-button';
import { SetBudgetModal } from './components/set-budget-modal';

export default function BudgetPage() {
  const params = useParams();
  const tripId = Number(params.tripId);

  const me = useAppSelector((s) => s.profile.currentUser);

  const { data: tripOverview, isLoading: tripLoading } = useGetTripOverview(tripId);

  const { data: budgetData, isLoading: budgetLoading, isError, error } = useGetTripBudget(tripId);

  const [tab, setTab] = useState<'category' | 'day'>('category');
  const [openModal, setOpenModal] = useState(false);

  const isOwner = isTripOwner(me, tripOverview);

  if (!tripId || Number.isNaN(tripId)) {
    return <Typography color="error">TripId ไม่ถูกต้อง</Typography>;
  }

  if (tripLoading || budgetLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Typography color="error">{(error as Error)?.message}</Typography>;
  }

  return (
    <Container maxWidth="md">
      <BudgetHeader
        data={budgetData ?? null}
        isOwner={isOwner}
        onOpenSetBudget={() => setOpenModal(true)}
        onEdit={() => setOpenModal(true)}
      />

      <BudgetTabs value={tab} onChange={setTab} />

      <CategoryList />

      <FloatingAddButton onClick={() => console.log('add expense')} />

      <SetBudgetModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        tripId={tripId}
        current={budgetData ?? null}
        isOwner={isOwner}
      />
    </Container>
  );
}
