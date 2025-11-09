'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Provider as StoreProvider, useDispatch, useSelector } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import type { RootState } from '@/store';
import { store } from '@/store';
import i18n from '@/lib/i18n.client';
import { setCurrentUser } from '@/store/profile-slice';
import { type Locale, setLocale } from '@/store/i18n-slice';
import { getProfile } from '@/api/users';

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const dispatch = useDispatch();

  useEffect(() => {
    const stored = globalThis.localStorage.getItem('lang');
    const normalized = stored ? (stored.toLowerCase() as Locale) : null;
    void i18n.changeLanguage(locale);

    if (normalized && normalized !== locale) {
      dispatch(setLocale(normalized));
      void i18n.changeLanguage(normalized);
      return;
    }

    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [dispatch, locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

const ProfileInitializer = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const currentUser = useSelector((s: RootState) => s.profile.currentUser);

  const shouldFetch = pathname !== '/login' && !currentUser;

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: () => getProfile({ me: true }),
    enabled: shouldFetch,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      dispatch(setCurrentUser(data));
    }
  }, [data, dispatch]);

  return null;
};

export const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider store={store}>
      <I18nProvider>
        <ProfileInitializer />
        {children}
      </I18nProvider>
    </StoreProvider>
  );
};

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </QueryProvider>
  );
};

export default AppProvider;
