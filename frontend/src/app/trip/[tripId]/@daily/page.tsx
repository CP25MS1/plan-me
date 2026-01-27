'use client';

import { Box } from '@mui/material';

import { useFullPageLoading } from '@/components/full-page-loading';
import SectionCard from '@/components/trip/overview/section-card';
import AddItemButton from '@/components/trip/overview/add-item-button';

import { useTripSelector, useI18nSelector } from '@/store/selectors';
import { formatDateByLocale, sortByDateAsc } from '@/lib/date';

const DailyPlanPage = () => {
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();
  const dailyPlans = tripOverview?.dailyPlans || [];

  const { FullPageLoading } = useFullPageLoading();

  if (!tripOverview) return <FullPageLoading />;

  return (
    <Box sx={{ mt: 2 }}>
      {sortByDateAsc(dailyPlans).map((plan, index) => {
        const titlePrefix = locale === 'en' ? 'Day' : 'วันที่';
        const planTitle = `${titlePrefix} ${index + 1}: ${formatDateByLocale(plan.date, locale)}`;
        const hasPlace = !!plan.scheduledPlaces?.length;
        return (
          <SectionCard key={`${plan.id}`} title={planTitle} asEmpty={!hasPlace}>
            <AddItemButton label={'เพิ่มสถานที่'} />
          </SectionCard>
        );
      })}
    </Box>
  );
};

export default DailyPlanPage;
