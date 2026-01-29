'use client';

import { useState } from 'react';
import { Box, Button, List, ListItem } from '@mui/material';

import { useFullPageLoading } from '@/components/full-page-loading';
import SectionCard from '@/components/trip/overview/section-card';
import AddItemButton from '@/components/trip/overview/add-item-button';
import ScheduledPlaceCard from './components/scheduled-place-card';

import { useI18nSelector, useTripSelector } from '@/store/selectors';
import { formatDateByLocale, sortByDateAsc } from '@/lib/date';
import { Plus } from 'lucide-react';
import SearchForScheduledPlacesDialog from './components/search-for-scheduled-places-dialog';

const DailyPlanPage = () => {
  const { locale } = useI18nSelector();
  const { tripOverview } = useTripSelector();
  const dailyPlans = tripOverview?.dailyPlans || [];

  const { FullPageLoading } = useFullPageLoading();

  const [searchDialogOpened, setSearchDialogOpened] = useState(false);

  if (!tripOverview) return <FullPageLoading />;

  return (
    <>
      <Box sx={{ mt: 2 }}>
        {sortByDateAsc(dailyPlans).map((plan, index) => {
          const titlePrefix = locale === 'en' ? 'Day' : 'วันที่';
          const planTitle = `${titlePrefix} ${index + 1}: ${formatDateByLocale(plan.date, locale)}`;
          const scheduledPlaces = plan.scheduledPlaces;
          const hasPlace = !!scheduledPlaces?.length;
          return (
            <SectionCard key={`${plan.id}`} title={planTitle} asEmpty={!hasPlace}>
              {hasPlace ? (
                <>
                  <List>
                    {scheduledPlaces
                      .toSorted((pA, pB) => pA.order - pB.order)
                      .map((place) => (
                        <ListItem key={place.id} sx={{ p: 0, mb: 2 }}>
                          <ScheduledPlaceCard
                            scheduledPlace={place}
                            locale={locale}
                          ></ScheduledPlaceCard>
                        </ListItem>
                      ))}
                  </List>

                  <Button
                    variant="contained"
                    onClick={() => setSearchDialogOpened(true)}
                    startIcon={<Plus />}
                  >
                    {'เพิ่มสถานที่'}
                  </Button>
                </>
              ) : (
                <AddItemButton label={'เพิ่มสถานที่'} onClick={() => setSearchDialogOpened(true)} />
              )}
            </SectionCard>
          );
        })}
      </Box>

      <SearchForScheduledPlacesDialog
        isOpened={searchDialogOpened}
        onClose={() => setSearchDialogOpened(false)}
      />
    </>
  );
};

export default DailyPlanPage;
