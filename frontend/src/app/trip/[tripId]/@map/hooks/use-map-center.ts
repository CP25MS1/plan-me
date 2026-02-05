import { useMemo } from 'react';
import { DailyPlan } from '@/api/trips';
import { usePlaceGeometry } from '@/lib/google-maps';
import { BANGKOK_LOCATION } from '@/constants/location';

export const useMapCenter = (dailyPlans: DailyPlan[], selectedDay: 'ALL' | number) => {
  const centerPlaceId = useMemo(() => {
    const plans = selectedDay === 'ALL' ? dailyPlans : [dailyPlans[selectedDay]];
    const firstDay = plans.find((d) => d.scheduledPlaces.length > 0);
    return firstDay?.scheduledPlaces[0]?.ggmp.ggmpId ?? null;
  }, [dailyPlans, selectedDay]);

  const { data } = usePlaceGeometry(centerPlaceId);
  return data ?? BANGKOK_LOCATION;
};
