import { RespondInvitationRequest, respondToInvitation } from '@/api/invite';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const useRespondToInvitation = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: ({ tripId, request }: { tripId: number; request: RespondInvitationRequest }) =>
      respondToInvitation(tripId, request),
    onSuccess: () => {
      showSuccess(t('notification.success.respond_invite'));
    },
    onError: () => {
      showError(t('notification.error.respond_invite'));
    },
  });
};
