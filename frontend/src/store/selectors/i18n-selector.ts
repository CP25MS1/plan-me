import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useI18nSelector = () => {
  const locale = useSelector((s: RootState) => s.i18n.locale);

  return {
    locale,
  };
};
