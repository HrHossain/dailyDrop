
import jwt, {type JwtPayload} from 'jsonwebtoken';
import { env } from '../validations/env.schema.js';


type ExpiresIn = string | number | undefined;
const JWT_SECRET = env.JWT_SECRET;
type AuthPayload = {
  userId: string;
  email: string;
};
type EmailVerificationPayload = {
  userId: string;
}

// generic token
const signToken = <T extends object>(payload:T,expiresIn:ExpiresIn) => {
 
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// generic token verification
const verifyToken = <T extends JwtPayload>(token: string): T => {
  return jwt.verify(token, JWT_SECRET) as T;
}

// email verification token
export const generateEmailVerificationToken = (userId:string) => {
    return signToken<EmailVerificationPayload>({ userId }, '15m');
}
export const verifyEmailVerificationToken = (token: string): EmailVerificationPayload => {
    return verifyToken<EmailVerificationPayload>(token);
}

// access token

export const generateAccessToken = (userId: string, email: string) =>
  signToken<AuthPayload>({ userId, email }, '1d');

export const verifyAccessToken = (token: string) =>
  verifyToken<AuthPayload>(token);

// refresh token

export const generateRefreshToken = (userId: string, email: string) =>
  signToken<AuthPayload>({ userId, email }, '3d');

export const verifyRefreshToken = (token: string) =>
  verifyToken<AuthPayload>(token);
