'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Provider as StoreProvider, useDispatch, useSelector } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import type { RootState } from '@/store';
import { store } from '@/store';
import i18n from '@/lib/i18n.client';
import { setCurrentUser, setInvitations } from '@/store/profile-slice';
import { setDefaultObjectives } from '@/store/constant-slice';
import { type Locale, setLocale } from '@/store/i18n-slice';
import { getProfile } from '@/api/users';
import { getDefaultObjectives } from '@/api/trips';
import ThemeProvider from './theme/theme-provider';
import { useNotificationsSelector } from '@/store/selectors';
import { getNotifications, NotificationDto } from '@/api/notification';
import { receiveNotifications } from '@/store/notifications-slice';
import { getMyReceivedInvitations } from '@/api/invite';

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

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

const StateInitializer = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isNotLoginPage = pathname !== '/login';
  const currentUser = useSelector((s: RootState) => s.profile.currentUser);
  const defaultObjectives = useSelector((s: RootState) => s.constant.defaultObjectives);
  const { notifications: userNotifications } = useNotificationsSelector();
  const pendingInvitations = useSelector((s: RootState) => s.profile.invitations);

  const shouldFetch = {
    profile: isNotLoginPage && !currentUser,
    objectives: isNotLoginPage && !defaultObjectives.length,
    notifications: isNotLoginPage && !userNotifications.length,
    invitations: isNotLoginPage && !pendingInvitations.length,
  };

  const { data: profile } = useQuery({
    queryKey: ['ME'],
    queryFn: () => getProfile({ me: true }),
    enabled: shouldFetch.profile,
    retry: false,
  });

  const { data: objectives } = useQuery({
    queryKey: ['DEFAULT_OBJECTIVES'],
    queryFn: () => getDefaultObjectives(),
    enabled: shouldFetch.objectives,
    retry: false,
  });

  const { data: notifications } = useQuery<NotificationDto[]>({
    queryKey: ['NOTIFICATIONS'],
    queryFn: () => getNotifications(),
    enabled: shouldFetch.notifications,
    retry: false,
  });

  const { data: invitations } = useQuery({
    queryKey: ['RECEIVED_INVITATIONS'],
    queryFn: () => getMyReceivedInvitations(),
    enabled: shouldFetch.invitations,
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      dispatch(setCurrentUser(profile));
    }
  }, [profile, dispatch]);

  useEffect(() => {
    if (objectives) {
      dispatch(setDefaultObjectives(objectives));
    }
  }, [objectives, dispatch]);

  useEffect(() => {
    if (notifications) {
      dispatch(receiveNotifications(notifications));
    }
  }, [notifications, dispatch]);

  useEffect(() => {
    if (invitations) {
      dispatch(setInvitations(invitations));
    }
  }, [invitations, dispatch]);

  return null;
};

export const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider store={store}>
      <I18nProvider>
        <StateInitializer />
        {children}
      </I18nProvider>
    </StoreProvider>
  );
};

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <ReduxProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ReduxProvider>
    </QueryProvider>
  );
};

export default AppProvider;
