'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import FullScreenMap from './components/full-screen-map';
import SelectDayInTrip from './components/select-day-in-trip';
import { useDailyPlansSelector, useTripSelector } from '@/store/selectors';

type DayFilter = 'ALL' | number;

const TripMapFullScreen = () => {
  const searchParams = useSearchParams();
  const { tripOverview } = useTripSelector();
  const dailyPlans = useDailyPlansSelector();
  const selectedPlaceId = searchParams.get('selectedPlaceId')
    ? Number(searchParams.get('selectedPlaceId'))
    : undefined;

  const computedDefaultDay: DayFilter = useMemo(() => {
    const daysWithPlaces = dailyPlans.filter((d) => (d?.scheduledPlaces ?? []).length > 0);

    if (daysWithPlaces.length === 0) return 'ALL';
    if (daysWithPlaces.length === 1) {
      return dailyPlans.findIndex((d) => (d?.scheduledPlaces ?? []).length > 0);
    }

    return 'ALL';
  }, [dailyPlans]);

  const [selectedDay, setSelectedDay] = useState<DayFilter>('ALL');

  useEffect(() => {
    if (tripOverview) {
      setSelectedDay(computedDefaultDay);
    }
  }, [tripOverview, computedDefaultDay]);

  useEffect(() => {
    if (selectedPlaceId) {
      setSelectedDay('ALL');
    }
  }, [selectedPlaceId]);

  if (!tripOverview) {
    return <></>;
  }

  return (
    <FullScreenMap
      header={{
        title: tripOverview.name,
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
