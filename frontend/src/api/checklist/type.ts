import { PublicUserInfo } from '@/api/users';

export interface TripChecklistDto {
  id: number;
  name: string;
  completed: boolean;
  tripId: number;
  createdBy: PublicUserInfo;
  assignedBy: PublicUserInfo | null;
  assignee: PublicUserInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripChecklistRequest {
  name: string;
}

export interface UpdateTripChecklistRequest {
  assigneeId?: number | null;
  name?: string;
  completed?: boolean;
}
