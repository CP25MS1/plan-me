'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as StoreProvider, useSelector, useDispatch } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import type { RootState } from '@/store';
import { store } from '@/store';
import i18n from '@/lib/i18n.client';
import { setCurrentUserId } from '@/store/profile-slice';
import { setLocale, type Locale } from '@/store/i18n-slice';

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const dispatch = useDispatch();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('lang') : null;
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

export const ReduxProvider = ({ children, userId }: { children: ReactNode; userId: number }) => {
  useEffect(() => {
    store.dispatch(setCurrentUserId(userId));
  }, [userId]);

  return (
    <StoreProvider store={store}>
      <I18nProvider>{children}</I18nProvider>
    </StoreProvider>
  );
};
