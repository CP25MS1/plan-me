'use client';

import { use } from 'react';
import { Container, Box } from '@mui/material';
import OverviewHeader from '@/components/trip/overview/overview-header';
import OverviewTabs from '@/components/trip/overview/overview-tabs';
import SectionCard from '@/components/trip/overview/section-card';
import { useFullPageLoading } from '@/components/full-page-loading';
import useGetTripOverview from '@/app/trip/[tripId]/hooks/use-get-trip-overview';
import CustomMap from '@/components/trip/map-component';
import { useUpdateTripOverview } from '@/app/trip/[tripId]/hooks/use-update-trip-overview';
import { UpsertTrip } from '@/api/trips';
import { useTranslation } from 'react-i18next';

const TripOverviewPage = ({ params }: { params: Promise<{ tripId: number }> }) => {
  const { tripId } = use(params);
  const { tripOverview, isLoading } = useGetTripOverview(tripId);
  const { FullPageLoading } = useFullPageLoading();
  const { mutate: updateTrip } = useUpdateTripOverview(tripId);
  const { t } = useTranslation('trip_overview');

  if (isLoading || !tripOverview) return <FullPageLoading />;

  const handleSave = (partial: Partial<UpsertTrip>) => {
    updateTrip(
      {
        name: partial.name ?? tripOverview.name,
        startDate: partial.startDate ?? tripOverview.startDate,
        endDate: partial.endDate ?? tripOverview.endDate,
        objectives: partial.objectives ?? tripOverview.objectives,
      }
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <OverviewHeader
        tripName={tripOverview.name}
        members={[tripOverview.owner.profilePicUrl ?? '/avatar1.png']}
        objectives={tripOverview.objectives}
        startDate={tripOverview.startDate}
        endDate={tripOverview.endDate}
        canEdit={tripOverview.canEdit}
        onUpdateTripName={(name) => handleSave({ name })}
        onUpdateDates={(start, end) => handleSave({ startDate: start, endDate: end })}
        onUpdateObjectives={(objectives) => handleSave({ objectives })}
      />

      <OverviewTabs value={0} onChange={() => {}} />

      <Box sx={{ mt: 2 }}>
        <SectionCard title={t('sectionCard.map')}>
          <Box sx={{ width: '100%' }}>
            <CustomMap />
          </Box>
        </SectionCard>

        <SectionCard
          title={t('sectionCard.reservation.title')}
          buttonLabel={t('sectionCard.reservation.button')}
          onAdd={() => {}}
        />

        <SectionCard
          title={t('sectionCard.whistlistPlace.title')}
          buttonLabel={t('sectionCard.whistlistPlace.button')}
          onAdd={() => {}}
        />
      </Box>
    </Container>
  );
};

export default TripOverviewPage;
