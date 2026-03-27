import { apiClient } from '@/api/client';
import {
  DefaultObjective,
  UpsertTrip,
  TripHeader,
  TripOverview,
  WishlistPlace,
  ComputeRouteRequestDto,
  TravelSegmentResponseDto,
  ToggleTripVisibilityRequest,
  ToggleTripVisibilityResponse,
  DailyPlan,
  CreateTripVersionRequest,
  TripVersion,
  ApplyTripVersionResponse,
} from './type';
import type { ReservationDto } from '@/api/reservations';

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

export const getTripHeader = async (tripId: number): Promise<TripHeader> => {
  const { data } = await apiClient.get(`/trips/${tripId}/header`);
  return data;
};

export const getTripReservations = async (tripId: number): Promise<ReservationDto[]> => {
  const { data } = await apiClient.get(`/trips/${tripId}/reservations`);
  return data;
};

export const getTripWishlistPlaces = async (tripId: number): Promise<WishlistPlace[]> => {
  const { data } = await apiClient.get(`/trips/${tripId}/wishlist-places`);
  return data;
};

export const getTripDailyPlans = async (tripId: number): Promise<DailyPlan[]> => {
  const { data } = await apiClient.get(`/trips/${tripId}/daily-plans`);
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

export const createTripVersion = async (
  tripId: number,
  payload: CreateTripVersionRequest
): Promise<TripVersion> => {
  const { data } = await apiClient.post(`/trips/${tripId}/versions`, payload);
  return data;
};

export const deleteTripVersion = async (tripId: number, versionId: number): Promise<void> => {
  await apiClient.delete(`/trips/${tripId}/versions/${versionId}`);
};

export const getTripVersions = async (
  tripId: number,
  includeSnapshot: boolean = false
): Promise<TripVersion[]> => {
  const { data } = await apiClient.get(`/trips/${tripId}/versions`, {
    params: { includeSnapshot },
  });
  return data;
};

export const applyTripVersion = async (
  tripId: number,
  versionId: number
): Promise<ApplyTripVersionResponse> => {
  const { data } = await apiClient.post(`/trips/${tripId}/versions/${versionId}/apply`);
  return data;
};
