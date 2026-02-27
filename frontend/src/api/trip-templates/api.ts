import { apiClient } from '@/api/client';
import { TripOverview } from '@/api/trips/type';
import {
  CreateTripFromPublicTemplateRequest,
  ListPublicTemplatesParams,
  ListPublicTemplatesResponse,
  PublicTripTemplateDetail,
} from './type';

export const listPublicTripTemplates = async (
  params?: ListPublicTemplatesParams
): Promise<ListPublicTemplatesResponse> => {
  const { data } = await apiClient.get('/trip-templates/public', {
    params: {
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
      ...(params?.cursor !== undefined ? { cursor: params.cursor } : {}),
    },
  });
  return data;
};

export const getPublicTripTemplate = async (
  templateTripId: number
): Promise<PublicTripTemplateDetail> => {
  const { data } = await apiClient.get(`/trip-templates/public/${templateTripId}`);
  return data;
};

export const createTripFromPublicTemplate = async (
  templateTripId: number,
  payload: CreateTripFromPublicTemplateRequest
): Promise<TripOverview> => {
  const { data } = await apiClient.post(`/trip-templates/public/${templateTripId}/trips`, payload);
  return data;
};
