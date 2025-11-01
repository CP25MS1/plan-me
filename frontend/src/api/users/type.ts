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

export interface CreateUserResponse {
  userId: number;
  username: string;
  email: string;
  idp: string;
  idpId: string;
  profilePicUrl: string;
  preference: {
    language: 'TH' | 'EN';
  };
  followers: [];
  followings: [];
}
