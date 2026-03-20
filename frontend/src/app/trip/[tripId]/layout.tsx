'use client';

import { ReactNode, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';

import { Container } from '@mui/material';

import TripTabPanel from './tab-panel/trip-tab-panel';
import { useFullPageLoading } from '@/components/full-page-loading';
import OverviewHeader, { OverviewHeaderProps } from '@/components/trip/overview/overview-header';
import OverviewTabs from '@/components/trip/overview/overview-tabs';

import { indexToTabKey, mapIndex, tabKeyToIndex } from './tab-panel/trip-tabs';
import useUpdateTripOverview from './hooks/use-update-trip-overview';
import { UpsertTrip, useTripHeader } from '@/api/trips';
import TripForbiddenPage from '@/app/trip/[tripId]/components/trip-forbidden-page';
import useTripRealtimeSse from '@/app/trip/[tripId]/hooks/use-trip-realtime-sse';

type TripLayoutProps = {
  params: Promise<{ tripId: string }>;
  overview: ReactNode;
  daily: ReactNode;
  budget: ReactNode;
  checklist: ReactNode;
  map: ReactNode;
};

const TripLayout = ({ overview, daily, budget, checklist, map, params }: TripLayoutProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const tabValue = tabKeyToIndex(tabParam);

  const handleTabChange = (newIndex: number) => {
    const key = indexToTabKey(newIndex);
    router.push(`?tab=${key}`, { scroll: false });
  };

  const { tripId } = use(params);
  const tripIdAsNumber = Number(tripId);

  useTripRealtimeSse(tripIdAsNumber);

  const { data: tripHeader, isLoading: isTripHeaderLoading, error, isError } =
    useTripHeader(tripIdAsNumber);

  const { mutate: updateTrip } = useUpdateTripOverview(tripIdAsNumber);
  const handleSave = useCallback(
    (updates: UpsertTrip) => {
      updateTrip(updates);
    },
    [updateTrip]
  );

  const { FullPageLoading } = useFullPageLoading();

  if (isError && (error as AxiosError)?.response?.status === 403) {
    return <TripForbiddenPage />;
  }

  if (isTripHeaderLoading || !tripHeader) return <FullPageLoading />;

  const tripOverviewProps: OverviewHeaderProps['tripOverview'] = {
    tripName: tripHeader.name,
    ownerId: tripHeader.owner.id,
    visibility: tripHeader.visibility,
    members: [
      {
        id: tripHeader.owner.id,
        username: tripHeader.owner.username,
        profilePicUrl: tripHeader.owner.profilePicUrl,
      },
      ...(tripHeader.tripmates ?? [])
        .filter((m) => m.id !== tripHeader.owner.id)
        .map((m) => ({
          id: m.id,
          username: m.username,
          profilePicUrl: m.profilePicUrl,
        })),
    ],

    objectives: tripHeader.objectives,
    startDate: tripHeader.startDate ?? undefined,
    endDate: tripHeader.endDate ?? undefined,

    onUpdateTripName: (name) =>
      handleSave({
        name,
        startDate: tripHeader.startDate ?? undefined,
        endDate: tripHeader.endDate ?? undefined,
        objectives: tripHeader.objectives,
      }),

    onUpdateDates: (start?, end?) => {
      handleSave({
        name: tripHeader.name,
        startDate: start,
        endDate: end,
        objectives: tripHeader.objectives,
      });
    },

    onUpdateObjectives: (objectives) =>
      handleSave({
        name: tripHeader.name,
        startDate: tripHeader.startDate ?? undefined,
        endDate: tripHeader.endDate ?? undefined,
        objectives,
      }),
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
