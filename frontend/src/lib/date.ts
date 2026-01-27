import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import 'dayjs/locale/th';
import 'dayjs/locale/en';

dayjs.extend(buddhistEra);

export const formatDateByLocale = (date: string | Date, locale: 'en' | 'th'): string => {
  const d = dayjs(date);

  if (!d.isValid()) {
    return '';
  }

  if (locale === 'th') {
    return d.locale('th').format('D MMMM BBBB');
  }

  return d.locale('en').format('D MMM YYYY');
};

type HasDate = {
  date: string | Date;
};

export const sortByDateAsc = <T extends HasDate>(items: T[]): T[] => {
  return [...items].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
};
