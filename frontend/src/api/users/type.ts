export interface LoginResponse {
  registered: boolean;
  username: string;
  email: string;
  idp: string;
  idpId: string;
  profilePicUrl: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  idp: string;
  idpId: string;
  profilePicUrl: string;
}

export interface PublicUserInfo {
  id: number;
  username: string;
  email: string;
  profilePicUrl: string;
}

export interface UserPreference {
  language: 'TH' | 'EN';
}

export interface UserProfile extends PublicUserInfo {
  id: number;
  idp: string;
  idpId: string;
  preference: UserPreference;
  followers: PublicUserInfo[];
  following: PublicUserInfo[];
}

export interface PublicUserInfo {
  id: number;
  username: string;
  email: string;
  profilePicUrl: string;
}

export interface UserPreference {
  language: 'TH' | 'EN';
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  idp: string;
  idpId: string;
  profilePicUrl: string;
  preference: UserPreference;
  followers: PublicUserInfo[];
  following: PublicUserInfo[];
}
