'use client';

import { ReactNode } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Box, Button, Container, Stack, Typography, Chip } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/button';
import TripTabPanel from '@/app/trip/[tripId]/tab-panel/trip-tab-panel';
import { indexToTabKey, mapIndex, tabKeyToIndex } from '@/app/trip/[tripId]/tab-panel/trip-tabs';
import OverviewTabs from '@/components/trip/overview/overview-tabs';
import { useFullPageLoading } from '@/components/full-page-loading';
import { useVersionTrip } from './hooks/use-version-trip';
import { useApplyTripVersion } from '@/api/trips/hooks';
import { useQueryClient } from '@tanstack/react-query';

type VersionLayoutProps = {
  overview: ReactNode;
  daily: ReactNode;
  budget: ReactNode;
  checklist: ReactNode;
  map: ReactNode;
};

const VersionLayout = ({ overview, daily, budget, checklist, map }: VersionLayoutProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('trip_overview');
  const queryClient = useQueryClient();
  const params = useParams<{ versionId: string }>();
  const tabParam = searchParams.get('tab');
  const tripIdParam = searchParams.get('tripId');
  const tabValue = tabKeyToIndex(tabParam);
  const { mutate: applyVersion, isPending } = useApplyTripVersion();

  const handleApplyVersion = () => {
    applyVersion(
      { tripId: tripIdAsNumber, versionId: versionTripIdAsNumber },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['trip-overview', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['tripReservations', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['tripWishlistPlaces', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['tripDailyPlans', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['tripChecklist', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-version', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-versions', tripIdAsNumber, true] }),
          ]);

          router.push(`/trip/${tripIdAsNumber}`);
        },
      }
    );
  };

  const handleTabChange = (newIndex: number) => {
    if (newIndex === 2) return;
    const key = indexToTabKey(newIndex);
    router.push(`?tab=${key}&tripId=${tripIdParam}`, { scroll: false });
  };

  const { versionId } = params;
  const versionTripIdAsNumber = Number(versionId);
  const tripIdAsNumber = Number(tripIdParam);
  const { version, snapshot, isLoading, isError } = useVersionTrip(
    tripIdAsNumber,
    versionTripIdAsNumber
  );
  const { FullPageLoading } = useFullPageLoading();

  if (isLoading) return <FullPageLoading />;

  if (isError || !version || !snapshot) {
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

  const createdAtText = dayjs(version.createdAt).format('DD MMM YYYY HH:mm');

  return (
    <>
      {tabValue === mapIndex ? (
        map
      ) : (
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <BackButton onBack={() => router.push(`/trip/${tripIdParam}`)} />

              {!version.isCurrent && (
                <Button variant="contained" onClick={handleApplyVersion} disabled={isPending}>
                  Use this version
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Version Name
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography variant="h5" fontWeight={700} noWrap title={version.versionName}>
                  {version.versionName}
                </Typography>

                <Chip
                  size="small"
                  label={version.isCurrent ? 'Latest' : 'Version'}
                  color={version.isCurrent ? 'success' : 'default'}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Trip Name
              </Typography>

              <Typography variant="body1" noWrap title={snapshot.name}>
                {snapshot.name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Created At
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {createdAtText}
              </Typography>
            </Box>
          </Box>

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

export default VersionLayout;
