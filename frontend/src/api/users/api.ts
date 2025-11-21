import { apiClient } from '@/api/client';
import {
  LoginResponse,
  CreateUserPayload,
  PublicUserInfo,
  UserPreference,
  UserProfile,
} from './type';
import { Page } from '@/api/shared-types';

export const login = async (code: string): Promise<LoginResponse> => {
  const { data } = await apiClient.get('/auth/google/callback', {
    params: { code },
  });
  return data;
};

export const createUser = async (user: CreateUserPayload): Promise<UserProfile> => {
  const payload = {
    username: user.username,
    email: user.email,
    idp: user.idp,
    idpId: user.idpId,
    profilePicUrl: user.profilePicUrl,
  };

  const { data } = await apiClient.post('/auth/register', payload);
  return data;
};

export const getProfile = async (arg: number | { me: true }): Promise<UserProfile> => {
  const endpoint =
    typeof arg === 'object' && arg.me ? '/users/me/profile' : `/users/${arg}/profile`;

  const { data } = await apiClient.get(endpoint);
  return data;
};

export const updatePreference = async (preference: UserPreference): Promise<UserPreference> => {
  const { data } = await apiClient.put('/users/me/preference', preference);
  return data;
};

export const followUser = async (followingId: number): Promise<PublicUserInfo> => {
  const { data } = await apiClient.post('/users/me/following', { followingId });
  return data;
};

export const unfollowUser = async (followingId: number) => {
  await apiClient.delete('/users/me/following', { data: { followingId } });
};

export const removeFollower = async (followerId: number) => {
  await apiClient.delete('/users/me/followers', { data: { followerId } });
};

export const searchUsers = async (q: string, page: number): Promise<Page<PublicUserInfo>> => {
  const { data } = await apiClient.get(
    `/users/search?q=${q}&page=${page}&size=10&sort=username,asc`
  );
  return data;
};
