'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inviteTrip } from '@/api/invite/api';
import { InviteTripRequestDto } from '@/api/invite/type';

import { TRIPMATES_QUERY_KEY } from './use-get-tripmates';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useInviteTrip = (tripId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useSnackbar();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (payload: InviteTripRequestDto) => inviteTrip(tripId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRIPMATES_QUERY_KEY(tripId),
      });
      showSuccess(t('notification.success.send'));
    },
    onError: () => {
      showError(t('notification.error.send'));
    },
  });
};
