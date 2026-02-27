'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ListPublicTemplatesParams,
  ListPublicTemplatesResponse,
  listPublicTripTemplates,
} from '@/api/trip-templates';

export const useListPublicTripTemplates = (params?: ListPublicTemplatesParams) => {
  return useQuery<ListPublicTemplatesResponse>({
    queryKey: ['public-trip-templates', params?.limit ?? null, params?.cursor ?? null],
    queryFn: () => listPublicTripTemplates(params),
  });
};
