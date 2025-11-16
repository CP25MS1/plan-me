import { PublicUserInfo } from '@/api/users';

export interface CustomObjective {
  id: number;
  name: string;
  badgeColor: string;
}

export interface DefaultObjective extends CustomObjective {
  boId: number;
  TH: string;
  EN: string;
}

export type Objective = CustomObjective | DefaultObjective;

type UpsertObjective =
  | Pick<DefaultObjective, 'boId'>
  | Pick<CustomObjective, 'name' | 'badgeColor'>;

export interface UpsertTrip {
  id: number | null;
  name: string;
  startDate: string;
  endDate: string;
  objectives: UpsertObjective[];
}

export interface TripOverview {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  owner: PublicUserInfo;
  objectives: Objective[];
}
