import { apiClient } from '@/api/client';
import {
  DefaultObjective,
  UpsertTrip,
  TripOverview,
  WishlistPlace,
  ComputeRouteRequestDto,
  TravelSegmentResponseDto,
  ToggleTripVisibilityRequest,
  ToggleTripVisibilityResponse,
} from './type';

export const getDefaultObjectives = async (): Promise<DefaultObjective[]> => {
  const { data } = await apiClient.get('/trips/objectives');
  return data;
};

export const createTrip = async (tripInfo: UpsertTrip): Promise<TripOverview> => {
  const { data } = await apiClient.post('/trips', tripInfo);
  return data;
};

export const getTripOverview = async (tripId: number): Promise<TripOverview> => {
  const { data } = await apiClient.get(`/trips/${tripId}/overview`);
  return data;
};

export const updateTripOverview = async (
  tripId: number,
  tripInfo: UpsertTrip
): Promise<TripOverview> => {
  const { data } = await apiClient.put(`/trips/${tripId}`, tripInfo);
  return data;
};

export const addPlaceToWishlist = async ({
  tripId,
  ggmpId,
}: {
  tripId: number;
  ggmpId: string;
}) => {
  const { data } = await apiClient.post<WishlistPlace>(`/trips/${tripId}/wishlist-places`, {
    ggmpId,
  });
  return data;
};

export const updateWishlistPlaceNote = async ({
  tripId,
  placeId,
  notes,
}: {
  tripId: number;
  placeId: number;
  notes: string;
}) => {
  const { data } = await apiClient.patch<{ notes: string }>(
    `/trips/${tripId}/wishlist-places/${placeId}`,
    { notes }
  );
  return data;
};

export const removePlaceFromWishlist = async ({
  tripId,
  placeId,
}: {
  tripId: number;
  placeId: number;
}) => {
  await apiClient.delete(`/trips/${tripId}/wishlist-places/${placeId}`);
};

export const createTravelSegment = async (
  payload: ComputeRouteRequestDto
): Promise<TravelSegmentResponseDto> => {
  const { data } = await apiClient.post('/travel-segments', payload);
  return data;
};

export const toggleTripVisibility = async (
  tripId: number,
  payload: ToggleTripVisibilityRequest
): Promise<ToggleTripVisibilityResponse> => {
  const { data } = await apiClient.patch(`/trips/${tripId}/visibility`, payload);
  return data;
};

export const deleteTrip = async (tripId: number): Promise<void> => {
  await apiClient.delete(`/trips/${tripId}`);
};
