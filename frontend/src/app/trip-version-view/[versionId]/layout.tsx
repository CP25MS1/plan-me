'use client';

import { ReactNode, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import TripTabPanel from '@/app/trip/[tripId]/tab-panel/trip-tab-panel';
import { indexToTabKey, mapIndex, tabKeyToIndex } from '@/app/trip/[tripId]/tab-panel/trip-tabs';
import { useApplyTripVersion } from '@/api/trips/hooks';
import { BackButton } from '@/components/button';
import { useFullPageLoading } from '@/components/full-page-loading';
import OverviewTabs from '@/components/trip/overview/overview-tabs';
import { tokens } from '@/providers/theme/design-tokens';
import { useAppSelector } from '@/store';

import { useVersionTrip } from './hooks/use-version-trip';
import ApplyVersionDialog from './components/apply-version-dialog';
import { useI18nSelector } from '@/store/selectors';

type VersionLayoutProps = {
  overview: ReactNode;
  daily: ReactNode;
  budget: ReactNode;
  checklist: ReactNode;
  map: ReactNode;
};

const VersionLayout = ({ overview, daily, checklist, map }: VersionLayoutProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();
  const queryClient = useQueryClient();
  const params = useParams<{ versionId: string }>();
  const tabParam = searchParams.get('tab');
  const tripIdParam = searchParams.get('tripId');
  const tabValue = tabKeyToIndex(tabParam);
  const { mutate: applyVersion, isPending } = useApplyTripVersion();
  const me = useAppSelector((s) => s.profile.currentUser);

  const { versionId } = params;
  const versionTripIdAsNumber = Number(versionId);
  const tripIdAsNumber = Number(tripIdParam);

  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const handleApplyVersion = async () => {
    await applyVersion(
      { tripId: tripIdAsNumber, versionId: versionTripIdAsNumber },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['trip-overview', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-reservations', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-wishlist-places', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-daily-plans', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-checklist', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-version', tripIdAsNumber] }),
            queryClient.invalidateQueries({ queryKey: ['trip-versions', tripIdAsNumber, true] }),
          ]);

          router.push(`/trip/${tripIdAsNumber}`);
        },
      }
    );
    setIsApplyDialogOpen(false);
  };

  const handleTabChange = (newIndex: number) => {
    if (newIndex === 2) return;
    const key = indexToTabKey(newIndex);
    router.push(`?tab=${key}&tripId=${tripIdParam}`, { scroll: false });
  };

  const { version, snapshot, isLoading, isError } = useVersionTrip(
    tripIdAsNumber,
    versionTripIdAsNumber
  );
  const isOwner = snapshot?.owner?.id === me?.id;

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

  const createdAtText = dayjs(version.createdAt).locale(locale).format('DD MMM YYYY HH:mm');

  return (
    <>
      {tabValue === mapIndex ? (
        map
      ) : (
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
              <Box
                sx={{
                  minWidth: { xs: 84, sm: 112 },
                  flexShrink: 0,
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <BackButton onBack={() => router.push(`/trip/${tripIdParam}`)} />
              </Box>

              <Box sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  noWrap
                  title={snapshot.name}
                  sx={{ px: 1 }}
                >
                  {snapshot.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: { xs: 84, sm: 112 },
                  flexShrink: 0,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {isOwner ? (
                  <Button
                    variant="contained"
                    onClick={() => setIsApplyDialogOpen(true)}
                    disabled={isPending}
                    sx={{ minWidth: { xs: 84, sm: 112 } }}
                  >
                    {t('version.viewLayout.applyButton')}
                  </Button>
                ) : null}
              </Box>
            </Box>

            <Stack spacing={1.5} sx={{ mt: 2, width: '100%' }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                sx={{ gap: 1 }}
              >
                {version.isCurrent && (
                  <Chip
                    size="small"
                    label={t('version.viewLayout.latestBadge')}
                    sx={{
                      width: 'fit-content',
                      height: 24,
                      borderRadius: '999px',
                      bgcolor: tokens.color.lightBackground,
                      color: tokens.color.textSecondary,
                      border: `1px solid ${tokens.color.textplaceholder}`,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: 11,
                        fontWeight: 600,
                      },
                    }}
                  />
                )}

                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  {t('version.viewLayout.createdAt', { date: createdAtText })}
                </Typography>
              </Stack>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('version.viewLayout.versionNameLabel')}
                </Typography>
                <Typography variant="h6" fontWeight={600} noWrap title={snapshot.name}>
                  {version.versionName}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                {t('version.viewLayout.dateLabel')}{' '}
                {snapshot.startDate ? dayjs(snapshot.startDate).locale(locale).format('DD/MM/YYYY') : '-'}{' '}
                - {snapshot.endDate ? dayjs(snapshot.endDate).locale(locale).format('DD/MM/YYYY') : '-'}
              </Typography>

              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ gap: '8px', rowGap: '6px' }}>
                {snapshot.objectives?.length ? (
                  snapshot.objectives.map((obj) => (
                    <Chip
                      key={obj.name}
                      label={obj.name}
                      size="small"
                      sx={{ bgcolor: obj.badgeColor ?? '#C8F7D8', pointerEvents: 'none' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('version.viewLayout.noObjectives')}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>

          <OverviewTabs value={tabValue} onChange={handleTabChange} hiddenTabs={[2]} />

          <TripTabPanel value={tabValue} index={0}>
            {overview}
          </TripTabPanel>

          <TripTabPanel value={tabValue} index={1}>
            {daily}
          </TripTabPanel>

          <TripTabPanel value={tabValue} index={3}>
            {checklist}
          </TripTabPanel>
        </Container>
      )}
      <ApplyVersionDialog
        open={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        onConfirm={handleApplyVersion}
        isLoading={isPending}
      />
    </>
  );
};

export default VersionLayout;
