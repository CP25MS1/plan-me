import type { Objective, TripVisibility } from '@/api/trips';
import type { PublicUserInfo } from '@/api/users';

export interface TripSummary {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  objectives?: Objective[];
  owner?: PublicUserInfo;
  visibility?: TripVisibility;
}
