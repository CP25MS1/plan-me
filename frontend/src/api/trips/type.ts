import { PublicUserInfo } from '@/api/users';

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
}

// Wishlist Place

export type WishlistPlace = {
  id: number;
  tripId: number;
  notes: string;
  place: {
    ggmpId: string;
    rating: number;
    TH: LocalizedPlace;
    EN: LocalizedPlace;
    opening_hours: string;
    default_pic_url: string;
  };
};

type LocalizedPlace = {
  name: string;
  description: string;
  address: string;
};
