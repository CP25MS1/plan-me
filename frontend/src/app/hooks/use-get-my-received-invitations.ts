import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getMyReceivedInvitations } from '@/api/invite';
import { useEffect } from 'react';
import { setInvitations } from '@/store/profile-slice';

export const useGetMyReceivedInvitations = () => {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['RECEIVED_INVITATIONS'],
    queryFn: () => getMyReceivedInvitations(),
    retry: false,
    gcTime: 0,
  });

  const invitations = query.data;

  useEffect(() => {
    if (invitations) {
      dispatch(setInvitations(invitations));
    }
  }, [invitations, dispatch]);

  return query;
};
