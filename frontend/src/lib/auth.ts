import { jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const verifyJwt = async (token: string): Promise<boolean> => {
  return jwtVerify(token, JWT_SECRET)
    .then(() => true)
    .catch(() => false);
};

export const decodeJwt = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};
