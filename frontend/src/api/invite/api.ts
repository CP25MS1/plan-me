import { apiClient } from '@/api/client';
import { PublicUserInfo } from '@/api/users';

import {
  InviteActionResponseDto,
  InviteTripRequestDto,
  InviteTripResponseDto,
  PendingInvitationDto,
  RespondInvitationRequest,
  TripmateResponseDto,
} from './type';

// ================= FRIENDS =================

export const getFriends = async (): Promise<PublicUserInfo[]> => {
  const { data } = await apiClient.get('/users/me/friends');
  return data;
};

// ================= INVITE =================

export const inviteTrip = async (
  tripId: number,
  payload: InviteTripRequestDto
): Promise<InviteTripResponseDto> => {
  const { data } = await apiClient.post(`/trips/${tripId}/invites`, payload);
  return data;
};

export const acceptTripInvite = async (
  tripId: number,
  inviteId: number
): Promise<InviteActionResponseDto> => {
  const { data } = await apiClient.post(`/trips/${tripId}/invites/${inviteId}/accept`);
  return data;
};

export const rejectTripInvite = async (
  tripId: number,
  inviteId: number
): Promise<InviteActionResponseDto> => {
  const { data } = await apiClient.post(`/trips/${tripId}/invites/${inviteId}/reject`);
  return data;
};

// ================= TRIPMATES =================

export const getTripmates = async (tripId: number): Promise<TripmateResponseDto> => {
  const { data } = await apiClient.get(`/trips/${tripId}/tripmates`);
  return data;
};

// ================= PENDING INVITATIONS =================
export const getMyReceivedInvitations = async () => {
  const { data } = await apiClient.get<PendingInvitationDto[]>('/trips/pending-invitations/me');
  return data;
};

// ================= INVITATION CODE =================
export const getTripInvitationCode = async (tripId: number) => {
  const { data } = await apiClient.get<string>(`/trips/${tripId}/invitation-code`);
  return data;
};

export const respondToInvitation = async (tripId: number, request: RespondInvitationRequest) => {
  await apiClient.post(`/trips/${tripId}/invitation-code/apply`, request);
};
