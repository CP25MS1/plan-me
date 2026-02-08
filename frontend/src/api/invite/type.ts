import { PublicUserInfo } from '@/api/users';

// ===== Friends =====
export type FriendResponseDto = PublicUserInfo;

// ===== Invite Trip =====
export interface InviteTripRequestDto {
  receiverIds: number[];
}

export interface InviteTripItemDto {
  invitationId: number;
  userId: number;
}

export interface InviteTripResponseDto {
  tripId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  invites: InviteTripItemDto[];
}

// ===== Invite Action =====
export interface InviteActionResponseDto {
  tripId: number;
  invitationId: number;
  status: 'ACCEPTED' | 'REJECTED';
}

// ===== Tripmates =====
export interface JoinedTripmateDto {
  userId: number;
  username: string;
  email: string;
  profilePicUrl: string;
}

export interface PendingTripmateDto extends JoinedTripmateDto {
  invitationId: number;
}

export interface TripmateResponseDto {
  tripId: number;
  joined: JoinedTripmateDto[];
  pending: PendingTripmateDto[];
}
