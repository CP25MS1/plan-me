import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const verifyJwt = async (token: string): Promise<boolean> => {
  return jwtVerify(token, JWT_SECRET)
    .then(() => true)
    .catch(() => false);
};
