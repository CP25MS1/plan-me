'use client';

import { useEffect, useMemo, useState } from 'react';

import FullScreenMap from './components/full-screen-map';
import SelectDayInTrip from './components/select-day-in-trip';
import { useDailyPlansSelector, useTripSelector } from '@/store/selectors';

type DayFilter = 'ALL' | number;

const TripMapFullScreen = () => {
  const { tripOverview } = useTripSelector();
  const dailyPlans = useDailyPlansSelector();

  const firstDayWithPlaceIndex = useMemo(() => {
    return dailyPlans.findIndex((d) => d.scheduledPlaces.length > 0);
  }, [dailyPlans]);

  const computedDefaultDay: DayFilter =
    firstDayWithPlaceIndex === -1 ? 'ALL' : firstDayWithPlaceIndex;

  const [selectedDay, setSelectedDay] = useState<DayFilter>('ALL');

  useEffect(() => {
    if (tripOverview) {
      setSelectedDay(computedDefaultDay);
    }
  }, [tripOverview, computedDefaultDay]);

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
    />
  );
};

export default TripMapFullScreen;
