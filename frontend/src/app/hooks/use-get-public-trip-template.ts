'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicTripTemplate, PublicTripTemplateDetail } from '@/api/trip-templates';

export const useGetPublicTripTemplate = (templateTripId: number) => {
  return useQuery<PublicTripTemplateDetail>({
    queryKey: ['public-trip-template', templateTripId],
    queryFn: () => getPublicTripTemplate(templateTripId),
    enabled: templateTripId > 0,
  });
};
