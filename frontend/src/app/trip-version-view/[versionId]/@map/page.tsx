// @map/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

import FullScreenMap from '@/app/trip/[tripId]/@map/components/full-screen-map';
import SelectDayInTrip from '@/app/trip/[tripId]/@map/components/select-day-in-trip';
import { useVersionTrip } from '../hooks/use-version-trip';
import { useFullPageLoading } from '@/components/full-page-loading';

type DayFilter = 'ALL' | number;

const VersionMapPage = () => {
  const params = useParams<{ versionId: string }>();
  const searchParams = useSearchParams();
  const tripIdParam = searchParams.get('tripId') || '';
  const tripId = Number(tripIdParam);
  const versionId = Number(params.versionId);

  const { version, mapPlans, isLoading } = useVersionTrip(tripId, versionId);
  const { FullPageLoading } = useFullPageLoading();

  const selectedPlaceId = searchParams.get('selectedPlaceId')
    ? Number(searchParams.get('selectedPlaceId'))
    : undefined;

  const computedDefaultDay: DayFilter = useMemo(() => {
    const daysWithPlaces = mapPlans.filter((d) => (d?.scheduledPlaces ?? []).length > 0);

    if (daysWithPlaces.length === 0) return 'ALL';
    if (daysWithPlaces.length === 1) {
      return mapPlans.findIndex((d) => (d?.scheduledPlaces ?? []).length > 0);
    }

    return 'ALL';
  }, [mapPlans]);

  const [selectedDay, setSelectedDay] = useState<DayFilter>('ALL');

  useEffect(() => {
    if (version) {
      setSelectedDay(computedDefaultDay);
    }
  }, [version, computedDefaultDay]);

  useEffect(() => {
    if (selectedPlaceId) {
      setSelectedDay('ALL');
    }
  }, [selectedPlaceId]);

  if (isLoading || !version) {
    return <FullPageLoading />;
  }

  return (
    <FullScreenMap
      header={{
        title: version.versionName || version.snapshot?.name || '',
        cta: (
          <SelectDayInTrip
            dailyPlans={mapPlans}
            selectedDay={selectedDay}
            onChange={setSelectedDay}
          />
        ),
      }}
      dailyPlans={mapPlans}
      selectedDay={selectedDay}
      focusedPlaceId={selectedPlaceId}
      readOnly
    />
  );
};

export default VersionMapPage;
