'use client';

import { ReactNode, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { Container } from '@mui/material';

import TripTabPanel from './tab-panel/trip-tab-panel';
import { useFullPageLoading } from '@/components/full-page-loading';
import OverviewHeader, { OverviewHeaderProps } from '@/components/trip/overview/overview-header';
import OverviewTabs from '@/components/trip/overview/overview-tabs';

import { indexToTabKey, mapIndex, tabKeyToIndex } from './tab-panel/trip-tabs';
import useGetTripOverview from './hooks/use-get-trip-overview';
import useUpdateTripOverview from './hooks/use-update-trip-overview';
import { UpsertTrip } from '@/api/trips';
import { setTripOverview } from '@/store/trip-detail-slice';

type TripLayoutProps = {
  params: { tripId: string };
  overview: ReactNode;
  daily: ReactNode;
  budget: ReactNode;
  checklist: ReactNode;
  map: ReactNode;
};

const TripLayout = ({ overview, daily, budget, checklist, map, params }: TripLayoutProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const tabValue = tabKeyToIndex(tabParam);

  const handleTabChange = (newIndex: number) => {
    const key = indexToTabKey(newIndex);
    router.push(`?tab=${key}`, { scroll: false });
  };

  const tripIdAsNumber = Number(params.tripId);
  const { overview: tripOverview, isLoading: isTripOverviewLoading } =
    useGetTripOverview(tripIdAsNumber);

  const { mutate: updateTrip } = useUpdateTripOverview(tripIdAsNumber);
  const handleSave = useCallback(
    (updates: UpsertTrip) => {
      updateTrip(updates, {
        onSuccess: (data) => dispatch(setTripOverview(data)),
      });
    },
    [updateTrip, dispatch]
  );

  const { FullPageLoading } = useFullPageLoading();

  useEffect(() => {
    if (tripOverview) {
      dispatch(setTripOverview(tripOverview));
    }
  }, [dispatch, tripOverview]);

  if (isTripOverviewLoading || !tripOverview) return <FullPageLoading />;

  const tripOverviewProps: OverviewHeaderProps['tripOverview'] = {
    tripName: tripOverview.name,
    members: [tripOverview.owner.profilePicUrl],
    objectives: tripOverview.objectives,
    startDate: tripOverview.startDate,
    endDate: tripOverview.endDate,

    onUpdateTripName: (name) => handleSave({ ...tripOverview, name }),

    onUpdateDates: (start?, end?) => {
      if (!start || !end) return;
      handleSave({
        ...tripOverview,
        startDate: start,
        endDate: end,
      });
    },

    onUpdateObjectives: (objectives) => handleSave({ ...tripOverview, objectives }),
  };

  return (
    <>
      {tabValue === mapIndex ? (
        map
      ) : (
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <OverviewHeader tripOverview={tripOverviewProps} />

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

export default TripLayout;
