import { PublicUserInfo } from '@/api/users';
import { ReservationDto } from '../reservations';
import { GoogleMapPlace } from '@/api/places';

export interface CustomObjective {
  id: number | null;
  name: string;
  badgeColor: string;
}

export interface DefaultObjective extends CustomObjective {
  boId: number;
  TH: string;
  EN: string;
}

export type Objective = CustomObjective | DefaultObjective;

export type UpsertObjective =
  | Pick<DefaultObjective, 'boId'>
  | Pick<CustomObjective, 'name' | 'badgeColor'>;

export interface UpsertTrip {
  id?: number;
  name: string;
  startDate?: string;
  endDate?: string;
  objectives?: UpsertObjective[];
}

export interface TripOverview {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  owner: PublicUserInfo;
  objectives: Objective[];
  reservations: ReservationDto[];
  wishlistPlaces: WishlistPlace[];
  dailyPlans: DailyPlan[];
  travelSegments: TravelSegmentResponseDto[];
}

// === Wishlist Place === //
export type WishlistPlace = {
  id: number;
  tripId: number;
  notes: string | null;
  place: {
    ggmpId: string;
    rating: number;
    th: LocalizedPlace;
    en: LocalizedPlace;
    openingHours: string; // JSON string as the form of OpeningHours type
    defaultPicUrl: string;
  };
};

type LocalizedPlace = {
  name: string;
  description: string;
  address: string;
};

export type OpeningHours = {
  periods: Period[];
};

/**
 * The periods that this place is open during the week. The periods are in chronological order, in the place-local timezone. An empty (but not absent) value indicates a place that is never open, e.g. because it is closed temporarily for renovations.
 *
 * The starting day of periods is NOT fixed and should not be assumed to be Sunday. The API determines the start day based on a variety of factors. For example, for a 24/7 business, the first period may begin on the day of the request. For other businesses, it might be the first day of the week that they are open.
 *
 * NOTE: The ordering of the periods array is independent of the ordering of the weekdayDescriptions array. Do not assume they will begin on the same day.
 **/
export type Period = {
  open: Point | null;
  close: Point | null;
};

/**
 * date: Date in the local timezone for the place.
 *
 * truncated: Whether this endpoint was truncated. Truncation occurs when the real hours are outside the times we are willing to return hours between, so we truncate the hours back to these boundaries. This ensures that at most 24 * 7 hours from midnight of the day of the request are returned.
 *
 * day: A day of the week, as an integer in the range 0-6. 0 is Sunday, 1 is Monday, etc.
 *
 * hour: The hour in 24-hour format. Ranges from 0 to 23.
 *
 * minute: The minute. Ranges from 0 to 59.**/
export type Point = {
  date: Date;
  truncated: boolean;
  day: number;
  hour: number;
  minute: number;
};

// === Daily Plan === //
export type DailyPlan = {
  id: number;
  date: string;
  pinColor: string;
  scheduledPlaces: ScheduledPlace[];
};

export type ScheduledPlace = {
  id: number;
  notes: string;
  order: number;
  ggmp: GoogleMapPlace;
};

export type TravelMode = 'CAR' | 'MOTORCYCLE' | 'WALK';

export interface ComputeRouteRequestDto {
  startPlaceId: string;
  endPlaceId: string;
  mode?: TravelMode;
}

export interface TravelSegmentResponseDto {
  startPlaceId: string;
  endPlaceId: string;
  mode: TravelMode;
  distance: number;
  regularDuration: number;
}
