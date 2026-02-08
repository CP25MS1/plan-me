'use client';

import { useQuery } from '@tanstack/react-query';
import { getFriends } from '@/api/invite/api';
import { PublicUserInfo } from '@/api/users';

export const FRIENDS_QUERY_KEY = ['friends'] as const;

export const useGetFriends = () =>
  useQuery<PublicUserInfo[]>({
    queryKey: FRIENDS_QUERY_KEY,
    queryFn: getFriends,
  });
