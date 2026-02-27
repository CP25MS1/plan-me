import { GoogleMapPlace } from '@/api/places';

export interface PublicTemplateObjective {
  name: string;
  badgeColor: string;
}

export interface PublicTripTemplateListItem {
  templateTripId: number;
  tripName: string;
  objectives: PublicTemplateObjective[];
  dayCount: number;
}

export interface ListPublicTemplatesParams {
  limit?: number;
  cursor?: string;
}

export interface ListPublicTemplatesResponse {
  items: PublicTripTemplateListItem[];
  nextCursor: string | null;
}

export interface PublicTemplateChecklistItem {
  name: string;
}

export interface PublicTemplateScheduledPlace {
  order: number;
  place: GoogleMapPlace;
}

export interface PublicTemplateDailyPlan {
  dayIndex: number;
  scheduledPlaces: PublicTemplateScheduledPlace[];
}

export interface PublicTemplateWishlistPlace {
  placeId: number;
  place: GoogleMapPlace;
}

export interface PublicTripTemplateDetail {
  templateTripId: number;
  tripName: string;
  objectives: PublicTemplateObjective[];
  wishlistPlaces: PublicTemplateWishlistPlace[];
  dailyPlans: PublicTemplateDailyPlan[];
  checklistItems: PublicTemplateChecklistItem[];
}

export interface CreateTripFromPublicTemplateRequest {
  name: string;
  startDate?: string;
  endDate?: string;
}
