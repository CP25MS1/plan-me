import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export const getUserFromToken = (): JwtPayload | null => {
  if (typeof window === 'undefined') return null;

  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('jwt='))
    ?.split('=')[1];

  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch (err) {
    console.error('❌ Failed to decode token:', err);
    return null;
  }
};
