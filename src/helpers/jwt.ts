import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  role: string;
};

export function signAccessToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function signRefreshToken(payload: JwtPayload) {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload & JwtPayload;
}

