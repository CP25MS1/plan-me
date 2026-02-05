import { useMemo } from 'react';
import { DailyPlan } from '@/api/trips';

export const useVisiblePlans = (dailyPlans: DailyPlan[], selectedDay: 'ALL' | number) =>
  useMemo(() => {
    if (selectedDay === 'ALL') return dailyPlans;
    return dailyPlans[selectedDay] ? [dailyPlans[selectedDay]] : [];
  }, [dailyPlans, selectedDay]);
