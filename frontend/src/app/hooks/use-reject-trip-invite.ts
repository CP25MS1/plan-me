'use client';

import { useMutation } from '@tanstack/react-query';

import { rejectTripInvite } from '@/api/invite/api';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useRejectTripInvite = (tripId: number) => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) => rejectTripInvite(tripId, inviteId),
    onSuccess: () => {
      showSuccess(t('notification.success.reject_invite'));
    },
    onError: () => {
      showError(t('notification.error.reject_invite'));
    },
  });
};
