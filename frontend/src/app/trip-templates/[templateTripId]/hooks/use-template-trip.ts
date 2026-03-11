'use client';

import { useMemo } from 'react';

import { useGetPublicTripTemplate } from '@/app/hooks';
import { DailyPlan, ScheduledPlace } from '@/api/trips';
import { tokens } from '@/providers/theme/design-tokens';

type TemplateDailyPlan = {
  dayIndex: number;
  pinColor: string;
  scheduledPlaces: ScheduledPlace[];
};

const PIN_COLORS = [
  tokens.color.primary,
  tokens.color.warning,
  tokens.color.info,
  tokens.color.error,
  tokens.color.success,
];

export const useTemplateTrip = (templateTripId: number) => {
  const query = useGetPublicTripTemplate(templateTripId);
  const template = query.data;

  const templateDailyPlans = useMemo<TemplateDailyPlan[]>(() => {
    if (!template) return [];

    const sortedPlans = [...(template.dailyPlans ?? [])].sort(
      (a, b) => a.dayIndex - b.dayIndex
    );

    let placeId = 1;

    return sortedPlans.map((plan, index) => {
      const scheduledPlaces = [...(plan.scheduledPlaces ?? [])]
        .sort((a, b) => a.order - b.order)
        .map((sp) => ({
          id: placeId++,
          notes: '',
          order: sp.order,
          ggmp: sp.place,
        }));

      return {
        dayIndex: plan.dayIndex ?? index + 1,
        pinColor: PIN_COLORS[index % PIN_COLORS.length],
        scheduledPlaces,
      };
    });
  }, [template]);

  const mapPlans = useMemo<DailyPlan[]>(
    () =>
      templateDailyPlans.map((plan) => ({
        id: plan.dayIndex,
        date: '',
        pinColor: plan.pinColor,
        scheduledPlaces: plan.scheduledPlaces,
      })),
    [templateDailyPlans]
  );

  const dayCount = useMemo(() => {
    if (templateDailyPlans.length === 0) return 0;
    return Math.max(...templateDailyPlans.map((plan) => plan.dayIndex));
  }, [templateDailyPlans]);

  return {
    ...query,
    template,
    templateDailyPlans,
    mapPlans,
    dayCount,
  };
};

export default useTemplateTrip;
