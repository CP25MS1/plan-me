import { ScheduledPlace } from '@/api/trips';

export const hasAnyAdjacentDuplicateGgmp = (places: ScheduledPlace[]): boolean => {
  for (let i = 1; i < places.length; i++) {
    if (places[i].ggmp.ggmpId === places[i - 1].ggmp.ggmpId) {
      return true;
    }
  }
  return false;
};
