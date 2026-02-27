'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateTripFromPublicTemplateRequest,
  createTripFromPublicTemplate,
} from '@/api/trip-templates';

type CreateTripFromPublicTemplateVars = {
  templateTripId: number;
  payload: CreateTripFromPublicTemplateRequest;
};

export const useCreateTripFromPublicTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateTripId, payload }: CreateTripFromPublicTemplateVars) =>
      createTripFromPublicTemplate(templateTripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['all-trips'],
      });
    },
  });
};
