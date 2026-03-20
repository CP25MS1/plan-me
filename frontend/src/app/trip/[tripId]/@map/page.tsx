'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import FullScreenMap from './components/full-screen-map';
import SelectDayInTrip from './components/select-day-in-trip';
import { useFullPageLoading } from '@/components/full-page-loading';
import { useTripDailyPlans, useTripHeader } from '@/api/trips';

type DayFilter = 'ALL' | number;

const TripMapFullScreen = () => {
  const params = useParams<{ tripId: string }>();
  const tripId = Number(params.tripId);
  const searchParams = useSearchParams();
  const { FullPageLoading } = useFullPageLoading();

  const { data: tripHeader, isLoading: isTripHeaderLoading } = useTripHeader(tripId);
  const { data: dailyPlans = [], isLoading: isDailyPlansLoading } = useTripDailyPlans(tripId);
  const selectedPlaceId = searchParams.get('selectedPlaceId')
    ? Number(searchParams.get('selectedPlaceId'))
    : undefined;

  const computedDefaultDay: DayFilter = useMemo(() => {
    const daysWithPlaces = dailyPlans.filter((d) => d.scheduledPlaces.length > 0);

    if (daysWithPlaces.length === 0) return 'ALL';
    if (daysWithPlaces.length === 1) {
      return dailyPlans.findIndex((d) => d.scheduledPlaces.length > 0);
    }

    return 'ALL';
  }, [dailyPlans]);

  const [selectedDay, setSelectedDay] = useState<DayFilter>('ALL');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    if (isTripHeaderLoading || isDailyPlansLoading) return;
    setSelectedDay(computedDefaultDay);
    initializedRef.current = true;
  }, [computedDefaultDay, isDailyPlansLoading, isTripHeaderLoading]);

  useEffect(() => {
    if (selectedPlaceId) {
      setSelectedDay('ALL');
    }
  }, [selectedPlaceId]);

  if (isTripHeaderLoading || isDailyPlansLoading) return <FullPageLoading />;
  if (!tripHeader) return null;

  return (
    <FullScreenMap
      header={{
        title: tripHeader.name,
        cta: (
          <SelectDayInTrip
            dailyPlans={dailyPlans}
            selectedDay={selectedDay}
            onChange={setSelectedDay}
          />
        ),
      }}
      dailyPlans={dailyPlans}
      selectedDay={selectedDay}
      focusedPlaceId={selectedPlaceId}
    />
  );
};

export default TripMapFullScreen;
