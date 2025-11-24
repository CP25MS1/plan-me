'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { Container, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import OverviewHeader from '@/components/trip/overview/overview-header';
import OverviewTabs from '@/components/trip/overview/overview-tabs';
import SectionCard from '@/components/trip/overview/section-card';
import { useFullPageLoading } from '@/components/full-page-loading';
import CustomMap from '@/components/trip/map-component';
import AddItemButton from '@/components/trip/overview/add-item-button';
import { useFullScreenDialog } from '@/components/common/dialog';

import useGetTripOverview from '../hooks/use-get-trip-overview';
import useUpdateTripOverview from '../hooks/use-update-trip-overview';
import { UpsertTrip } from '@/api/trips';
import SearchAddWishlistPlace from './components/search-add-wishlist-place';

const TripOverviewPage = ({ params }: { params: Promise<{ tripId: string }> }) => {
  const { tripId } = use(params);
  const tripIdAsNumber = Number(tripId);
  const { tripOverview: overviewResult, isLoading } = useGetTripOverview(tripIdAsNumber);
  const [tripOverview, setTripOverview] = useState(overviewResult);
  const { FullPageLoading } = useFullPageLoading();
  const { mutate: updateTrip } = useUpdateTripOverview(tripIdAsNumber);
  const { t } = useTranslation('trip_overview');

  const { Dialog: WishlistPlaceDialog } = useFullScreenDialog({
    EntryElement: <AddItemButton label={t('sectionCard.whistlistPlace.button')} />,
    Content: SearchAddWishlistPlace,
    contentProps: { tripId: tripIdAsNumber },
  });

  const handleSave = useCallback(
    (updates: UpsertTrip) => {
      updateTrip(
        {
          ...updates,
        },
        {
          onSuccess: (data) => {
            setTripOverview(data);
          },
        }
      );
    },
    [updateTrip]
  );

  useEffect(() => {
    setTripOverview(overviewResult);
  }, [overviewResult]);

  if (isLoading || !tripOverview) return <FullPageLoading />;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <OverviewHeader
        tripName={tripOverview.name}
        members={[tripOverview.owner.profilePicUrl ?? '']}
        objectives={tripOverview.objectives}
        startDate={tripOverview.startDate}
        endDate={tripOverview.endDate}
        onUpdateTripName={(name) => handleSave({ ...tripOverview, name })}
        onUpdateDates={(start, end) =>
          handleSave({ ...tripOverview, startDate: start, endDate: end })
        }
        onUpdateObjectives={(objectives) => handleSave({ ...tripOverview, objectives })}
      />

      <OverviewTabs value={0} onChange={() => {}} />

      <Box sx={{ mt: 2 }}>
        <SectionCard title={t('sectionCard.map')}>
          <Box sx={{ width: '100%' }}>
            <CustomMap />
          </Box>
        </SectionCard>

        <SectionCard title={t('sectionCard.reservation.title')} asEmpty>
          <AddItemButton label={t('sectionCard.reservation.button')} onClick={() => {}} />
        </SectionCard>

        <SectionCard title={t('sectionCard.whistlistPlace.title')} asEmpty>
          {WishlistPlaceDialog}
        </SectionCard>
      </Box>
    </Container>
  );
};

export default TripOverviewPage;
