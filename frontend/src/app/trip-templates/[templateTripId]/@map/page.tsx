'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

import FullScreenMap from '@/app/trip/[tripId]/@map/components/full-screen-map';
import SelectDayInTrip from '@/app/trip/[tripId]/@map/components/select-day-in-trip';
import { useTemplateTrip } from '../hooks/use-template-trip';
import { useFullPageLoading } from '@/components/full-page-loading';

type DayFilter = 'ALL' | number;

const TemplateMapPage = () => {
  const searchParams = useSearchParams();
  const params = useParams<{ templateTripId: string }>();
  const templateTripId = Number(params.templateTripId);

  const { template, mapPlans, isLoading } = useTemplateTrip(templateTripId);
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
    if (template) {
      setSelectedDay(computedDefaultDay);
    }
  }, [template, computedDefaultDay]);

  useEffect(() => {
    if (selectedPlaceId) {
      setSelectedDay('ALL');
    }
  }, [selectedPlaceId]);

  if (isLoading || !template) {
    return <FullPageLoading />;
  }

  return (
    <FullScreenMap
      header={{
        title: template.tripName,
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

export default TemplateMapPage;
