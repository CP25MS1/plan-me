import { ScheduledPlace } from '@/api/trips';

export const simulateReorder = (
  source: ScheduledPlace[],
  fromIndex: number,
  toIndex: number
): ScheduledPlace[] => {
  const result = [...source];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
};
