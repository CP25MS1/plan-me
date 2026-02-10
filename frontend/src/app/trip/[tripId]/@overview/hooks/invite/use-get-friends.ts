'use client';

import { useQuery } from '@tanstack/react-query';
import { getFriends } from '@/api/invite/api';
import { useAppDispatch } from '@/store';
import { setFriends } from '@/store/invite-slice';
import { PublicUserInfo } from '@/api/users';
import { useEffect } from 'react';

export const FRIENDS_QUERY_KEY = ['friends'] as const;

export const useGetFriends = () => {
  const dispatch = useAppDispatch();

  const query = useQuery<PublicUserInfo[]>({
    queryKey: FRIENDS_QUERY_KEY,
    queryFn: getFriends,
  });

  const { data } = query;

  useEffect(() => {
    if (data) {
      dispatch(setFriends(data));
    }
  }, [data, dispatch]);

  return query;
};
