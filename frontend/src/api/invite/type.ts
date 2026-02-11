import { PublicUserInfo } from '@/api/users';

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
export interface TripmateDto {
  user: PublicUserInfo
}

export interface PendingTripmateDto extends TripmateDto {
  invitationId: number;
}

export interface TripmateResponseDto {
  tripId: number;
  joined: TripmateDto[];
  pending: PendingTripmateDto[];
}

export type PendingInvitationDto = {
  invitationId: number;
  inviter: PublicUserInfo;
  tripId: number;
}

export type RespondInvitationRequest = {
  status: 'ACCEPTED' | 'REJECTED';
  invitationCode: string;
};
