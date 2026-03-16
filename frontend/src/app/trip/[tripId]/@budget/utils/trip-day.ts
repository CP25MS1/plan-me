import dayjs from '@/lib/dayjs';

export const getTripDayNumber = (dayKey: string, startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return null;

  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');
  const target = dayjs(dayKey).startOf('day');

  if (!start.isValid() || !end.isValid() || !target.isValid()) return null;
  if (target.isBefore(start) || target.isAfter(end)) return null;

  return target.diff(start, 'day') + 1;
};

