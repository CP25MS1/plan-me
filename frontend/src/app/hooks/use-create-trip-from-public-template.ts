'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateTripFromPublicTemplateRequest,
  createTripFromPublicTemplate,
} from '@/api/trip-templates';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { useTranslation } from 'react-i18next';

type CreateTripFromPublicTemplateVars = {
  templateTripId: number;
  payload: CreateTripFromPublicTemplateRequest;
};

export const useCreateTripFromPublicTemplate = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useSnackbar();

  return useMutation({
    mutationFn: ({ templateTripId, payload }: CreateTripFromPublicTemplateVars) =>
      createTripFromPublicTemplate(templateTripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['all-trips'],
      });
      showSuccess(t('notification.success.create_from_template'));
    },
    onError: () => {
      showError(t('notification.error.create_from_template'));
    },
  });
};
