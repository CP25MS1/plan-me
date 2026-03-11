'use client';

import { Box, List, ListItem, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import SectionCard from '@/components/trip/overview/section-card';
import ScheduledPlaceCard from '@/app/trip/[tripId]/@daily/components/scheduled-place-card';
import TravelSegmentSelect from '@/app/trip/[tripId]/@daily/components/travel-segment-select';
import { useI18nSelector } from '@/store/selectors';
import { useTemplateTrip } from '../hooks/use-template-trip';
import { useFullPageLoading } from '@/components/full-page-loading';
import TemplateEmptyState from '../components/template-empty-state';

const TemplateDailyPage = () => {
  const { t } = useTranslation('trip_overview');
  const { locale } = useI18nSelector();
  const params = useParams<{ templateTripId: string }>();
  const templateTripId = Number(params.templateTripId);

  const { templateDailyPlans, isLoading } = useTemplateTrip(templateTripId);
  const { FullPageLoading } = useFullPageLoading();

  if (isLoading) return <FullPageLoading />;

  if (templateDailyPlans.length === 0) {
    return (
      <TemplateEmptyState
        title={t('template.empty.daily.title')}
        description={t('template.empty.daily.body')}
      />
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {templateDailyPlans.map((plan) => {
        const titlePrefix = locale === 'en' ? 'Day' : 'วันที่';
        const planTitle = `${titlePrefix} ${plan.dayIndex}`;
        const scheduledPlaces = plan.scheduledPlaces;
        const hasPlace = scheduledPlaces.length > 0;

        return (
          <SectionCard key={plan.dayIndex} title={planTitle} asEmpty={!hasPlace}>
            {hasPlace ? (
              <List>
                {scheduledPlaces.map((place, idx, arr) => {
                  const prevPlace = arr[idx - 1];

                  return (
                    <ListItem key={place.id} sx={{ p: 0, mb: 2, width: '100%' }}>
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
                          mapBasePath={`/trip-templates/${templateTripId}`}
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
  );
};

export default TemplateDailyPage;
