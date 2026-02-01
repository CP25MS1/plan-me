import { OpeningHours, Period } from '@/api/trips';
import { TFunction } from 'i18next';

type TimePoint = { hour: number; minute: number };
type PeriodWithOpenClose = Period & {
  open: NonNullable<Period['open']>;
  close: NonNullable<Period['close']>;
};

const DAYS_IN_WEEK = 7;

const hasValidOpenClose = (p: Period): p is PeriodWithOpenClose => {
  return (
    p.open !== null &&
    p.close !== null &&
    p.open.day >= 0 &&
    p.open.day < DAYS_IN_WEEK
  );
};

const pad2 = (n: number) => n.toString().padStart(2, '0');

const formatTime = ({ hour, minute }: TimePoint): string => `${pad2(hour)}:${pad2(minute)}`;

const getWeekdayLabel = (dayIndex: number, locale: string): string => {
  const date = new Date(2023, 0, 1 + dayIndex);
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
};

const parseOpeningHours = (jsonStr?: string): OpeningHours | null => {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as OpeningHours;
  } catch {
    return null;
  }
};

export const formatOpeningHours = ({
  rawText,
  locale,
  translate,
}: {
  rawText: string;
  locale: string;
  translate: TFunction;
}): string[] => {
  const openingHours = parseOpeningHours(rawText);
  if (!openingHours?.periods?.length) {
    return [translate('sectionCard.wishlistPlace.opening_hours.no_data')];
  }

  const slots: string[][] = Array.from({ length: DAYS_IN_WEEK }, () => []);

  for (const period of openingHours.periods) {
    if (!hasValidOpenClose(period)) continue;

    const { open, close } = period;
    slots[open.day].push(`${formatTime(open)} - ${formatTime(close)}`);
  }

  return slots.map((ranges, dayIndex) => {
    const dayLabel = getWeekdayLabel(dayIndex, locale);
    const content =
      ranges.length > 0
        ? ranges.join(', ')
        : translate('sectionCard.wishlistPlace.opening_hours.closed');

    return `${dayLabel}: ${content}`;
  });
};
