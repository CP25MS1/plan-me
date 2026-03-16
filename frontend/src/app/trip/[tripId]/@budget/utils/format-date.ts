import dayjs from '@/lib/dayjs';
import type { SupportedLocale } from './format-number';

export const formatExpenseDateTime = (iso: string, locale: SupportedLocale) => {
  const d = dayjs(iso);

  if (!d.isValid()) return '';

  if (locale === 'th') {
    return d.locale('th').format('D MMM BBBB HH:mm');
  }

  return d.locale('en').format('D MMM YYYY HH:mm');
};

export const toDayKey = (iso: string) => {
  const d = dayjs(iso);
  return d.isValid() ? d.format('YYYY-MM-DD') : 'invalid';
};
