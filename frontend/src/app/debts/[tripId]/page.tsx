'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { DebtItem, useGetMyDebtSummary } from '@/api/debt';
import { tokens } from '@/providers/theme/design-tokens';
import { formatCurrencyTH } from '../utils/format-number';

type DebtSectionProps = {
  title: string;
  items: DebtItem[];
  total: number;
  amountColor: string;
  emptyLabel: string;
};

const DebtSection = ({ title, items, total, amountColor, emptyLabel }: DebtSectionProps) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600}>{title}</Typography>
          <Typography fontWeight={700} sx={{ color: amountColor }}>
            {formatCurrencyTH(total)}
          </Typography>
        </Stack>

        <Box sx={{ mt: 1 }}>
          {items.length === 0 ? (
            <Typography fontSize={14} color="text.secondary">
              {emptyLabel}
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1} sx={{ mt: 1 }}>
              {items.map((item) => (
                <Box
                  key={item.user.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}
                >
                  <Avatar src={item.user.profilePicUrl} sx={{ width: 40, height: 40 }} />

                  <Typography fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                    {item.user.username}
                  </Typography>

                  <Typography fontWeight={700} sx={{ color: amountColor, whiteSpace: 'nowrap' }}>
                    {formatCurrencyTH(Number(item.amount ?? 0))}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const sumAmounts = (items: DebtItem[]) =>
  items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

export default function DebtSummaryPage() {
  const { t } = useTranslation('trip_overview');
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const tripId = Number(params.tripId);

  const [tab, setTab] = useState<'full' | 'net'>('full');

  const { data, isLoading, isError, error } = useGetMyDebtSummary(tripId);

  const section = tab === 'full' ? data?.full : data?.net;
  const owedToMe = section?.owedToMe ?? [];
  const iOwed = section?.iOwed ?? [];

  const totalOwedToMe = useMemo(() => sumAmounts(owedToMe), [owedToMe]);
  const totalIOwed = useMemo(() => sumAmounts(iOwed), [iOwed]);

  if (!tripId || Number.isNaN(tripId)) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography color="error">{t('debtSummary.invalidTripId')}</Typography>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography color="error">
          {t('debtSummary.error')} {error instanceof Error ? `(${error.message})` : ''}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton
          aria-label={t('debtSummary.backAria')}
          onClick={() => router.push(`/trip/${tripId}?tab=budget`)}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={700}>
          {t('debtSummary.title')}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tab === 'full' ? 0 : 1}
          onChange={(_, v) => setTab(v === 0 ? 'full' : 'net')}
          variant="fullWidth"
        >
          <Tab label={t('debtSummary.tabFull')} />
          <Tab label={t('debtSummary.tabNet')} />
        </Tabs>
      </Box>

      <DebtSection
        title={t('debtSummary.owedToMeTitle')}
        items={owedToMe}
        total={totalOwedToMe}
        amountColor={tokens.color.success}
        emptyLabel={t('debtSummary.empty')}
      />

      <DebtSection
        title={t('debtSummary.iOwedTitle')}
        items={iOwed}
        total={totalIOwed}
        amountColor={tokens.color.error}
        emptyLabel={t('debtSummary.empty')}
      />
    </Container>
  );
}
