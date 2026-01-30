import { GoogleMapPlace } from '@/api/places';

export type CreateScheduledPlaceRequest = {
  planId: number;
  ggmpId: string;
  notes?: string;
}

export type UpdateScheduledPlaceRequest = {
  planId: number;
  notes?: string;
  order: number;
}

export type ScheduledPlaceDto = {
  tripId: number;
  planId: number;
  placeId: number;
  notes?: string;
  order: number;
  placeDetail: GoogleMapPlace;
};