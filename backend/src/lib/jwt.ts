import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AccessTokenPayload = {
  userId: string;
  email: string;
  type: 'access';
};

export type RefreshTokenPayload = {
  userId: string;
  sessionId: string;
  type: 'refresh';
};

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'type'>) =>
  jwt.sign({ ...payload, type: 'access' }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  });

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'type'>) =>
  jwt.sign({ ...payload, type: 'refresh' }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;

  if (payload.type !== 'access') {
    throw new Error('Invalid access token type');
  }

  return payload;
};

export const verifyRefreshToken = (token: string) => {
  const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;

  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }

  return payload;
};
