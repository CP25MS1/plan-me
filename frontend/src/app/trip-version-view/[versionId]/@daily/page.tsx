'use client';

import { Box, List, ListItem, Typography } from '@mui/material';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import SectionCard from '@/components/trip/overview/section-card';
import ScheduledPlaceCard from '@/app/trip/[tripId]/@daily/components/scheduled-place-card';
import TravelSegmentSelect from '@/app/trip/[tripId]/@daily/components/travel-segment-select';
import { useI18nSelector } from '@/store/selectors';
import { useFullPageLoading } from '@/components/full-page-loading';
import TemplateEmptyState from '../components/template-empty-state';
import { useVersionTrip } from '../hooks/use-version-trip';
import { OpeningDialogContext } from '@/app/trip/[tripId]/@daily/context/opening-dialog-context';
const VersionDailyPage = () => {
  const { locale } = useI18nSelector();
  const { t } = useTranslation('trip_overview');
  const params = useParams<{ versionId: string }>();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || '';
  const tripId = Number(tripIdParam);
  const versionId = Number(params.versionId);
  const { dailyPlans, isLoading } = useVersionTrip(tripId, versionId);
  const { FullPageLoading } = useFullPageLoading();
  const mockDialogContext = {
    isSearchDialogOpened: false,
    openSearchDialog: () => {},
    closeSearchDialog: () => {},
    isDetailsDialogOpened: false,
    selectedGgmpId: null,
    openDetailsDialog: () => {},
    closeDetailsDialog: () => {},
  };

  if (isLoading) return <FullPageLoading />;

  if (dailyPlans.length === 0) {
    return (
      <TemplateEmptyState
        title={t('template.empty.daily.title')}
        description={t('template.empty.daily.body')}
      />
    );
  }

  return (
    <OpeningDialogContext.Provider value={mockDialogContext}>
      <Box sx={{ mt: 2 }}>
        {dailyPlans.map((plan) => {
          const titlePrefix = locale === 'en' ? 'Day' : 'วันที่';
          const planTitle = `${titlePrefix} ${plan.dayIndex}`;
          const scheduledPlaces = plan.scheduledPlaces ?? [];
          const hasPlace = scheduledPlaces.length > 0;

          return (
            <SectionCard key={plan.id} title={planTitle} asEmpty={!hasPlace}>
              {hasPlace ? (
                <List>
                  {scheduledPlaces.map((place, idx, arr) => {
                    const prevPlace = arr[idx - 1];

                    return (
                      <ListItem key={place.id} sx={{ p: 0, width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          {prevPlace && (
                            <TravelSegmentSelect
                              start={prevPlace.ggmp.ggmpId}
                              end={place.ggmp.ggmpId}
                              readOnly
                            />
                          )}

                          <ScheduledPlaceCard
                            planId={plan.dayIndex}
                            scheduledPlace={place}
                            locale={locale}
                            dragHandleProps={null}
                            isDragging={false}
                            readOnly
                            mapBasePath={``}
                          />
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('template.empty.dailyItem')}
                  </Typography>
                </Box>
              )}
            </SectionCard>
          );
        })}
      </Box>
    </OpeningDialogContext.Provider>
  );
};

export default VersionDailyPage;
