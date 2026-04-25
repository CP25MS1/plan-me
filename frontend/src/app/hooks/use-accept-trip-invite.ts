'use client';

import { useMutation } from '@tanstack/react-query';
import { acceptTripInvite } from '@/api/invite/api';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

export const useAcceptTripInvite = (tripId: number) => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: number }) => acceptTripInvite(tripId, inviteId),
    onSuccess: () => {
      showSuccess(t('notification.success.accept_invite'));
    },
    onError: () => {
      showError(t('notification.error.accept_invite'));
    },
  });
};
