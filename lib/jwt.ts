
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-should-be-in-env');

export async function signJWT(payload: any) {
  return await new jose.SignJWT(payload)
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    return await jose.jwtVerify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}