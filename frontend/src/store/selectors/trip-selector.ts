import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { sortByDateAsc } from '@/lib/date';
import { DailyPlan, TripVisibility } from '@/api/trips';

export const useTripSelector = () => {
  const tripOverview = useSelector((s: RootState) => s.tripDetail.overview);

  return {
    tripOverview,
  };
};

export const useDailyPlansSelector = () => {
  const { tripOverview } = useTripSelector();

  const dailyPlans = tripOverview?.dailyPlans ?? [];

  return sortByDateAsc(
    dailyPlans.map((plan) => ({
      ...plan,
      scheduledPlaces: [...(plan.scheduledPlaces ?? [])].sort((a, b) => a.order - b.order),
    }))
  ) as DailyPlan[];
};

export const useTripVisibilitySelector = (tripId: number): TripVisibility | undefined => {
  return useSelector((s: RootState) => s.tripDetail.tripVisibilityById[tripId]);
};
