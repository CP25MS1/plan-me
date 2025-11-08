import { apiClient } from '@/api/client';
import { LoginResponse, CreateUserPayload, CreateUserResponse, PublicUserInfo } from './type';

export const login = async (code: string): Promise<LoginResponse> => {
  const { data } = await apiClient.get('/auth/google/callback', {
    params: { code },
  });
  return data;
};

export const createUser = async (user: CreateUserPayload): Promise<CreateUserResponse> => {
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
