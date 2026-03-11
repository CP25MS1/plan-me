'use client';

import { ReactNode, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TripTabPanel from '@/app/trip/[tripId]/tab-panel/trip-tab-panel';
import { indexToTabKey, mapIndex, tabKeyToIndex } from '@/app/trip/[tripId]/tab-panel/trip-tabs';
import OverviewTabs from '@/components/trip/overview/overview-tabs';
import { useFullPageLoading } from '@/components/full-page-loading';
import TemplateOverviewHeader from './components/template-overview-header';
import { useTemplateTrip } from './hooks/use-template-trip';

type TemplateLayoutProps = {
  params: Promise<{ templateTripId: string }>;
  overview: ReactNode;
  daily: ReactNode;
  budget: ReactNode;
  checklist: ReactNode;
  map: ReactNode;
};

const TemplateLayout = ({ overview, daily, budget, checklist, map, params }: TemplateLayoutProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('trip_overview');

  const tabParam = searchParams.get('tab');
  const tabValue = tabKeyToIndex(tabParam);

  const handleTabChange = (newIndex: number) => {
    const key = indexToTabKey(newIndex);
    router.push(`?tab=${key}`, { scroll: false });
  };

  const { templateTripId } = use(params);
  const templateTripIdAsNumber = Number(templateTripId);

  const { template, isLoading, isError, dayCount } = useTemplateTrip(templateTripIdAsNumber);
  const { FullPageLoading } = useFullPageLoading();

  if (isLoading) return <FullPageLoading />;

  if (isError || !template) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        bgcolor="background.default"
      >
        <Stack spacing={2} alignItems="center" maxWidth={420} textAlign="center">
          <Typography variant="h5" fontWeight={600}>
            {t('template.error.title')}
          </Typography>
          <Typography color="text.secondary">{t('template.error.description')}</Typography>
          <Button variant="contained" onClick={() => router.push('/home')}>
            {t('template.error.cta')}
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <>
      {tabValue === mapIndex ? (
        map
      ) : (
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <TemplateOverviewHeader
            templateTripId={templateTripIdAsNumber}
            tripName={template.tripName}
            objectives={template.objectives}
            dayCount={dayCount}
          />

          <OverviewTabs value={tabValue} onChange={handleTabChange} />

          <TripTabPanel value={tabValue} index={0}>
            {overview}
          </TripTabPanel>

          <TripTabPanel value={tabValue} index={1}>
            {daily}
          </TripTabPanel>

          <TripTabPanel value={tabValue} index={2}>
            {budget}
          </TripTabPanel>

          <TripTabPanel value={tabValue} index={3}>
            {checklist}
          </TripTabPanel>
        </Container>
      )}
    </>
  );
};

export default TemplateLayout;
