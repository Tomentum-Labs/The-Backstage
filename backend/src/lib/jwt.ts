import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AccessTokenPayload = {
  userId: string;
  email: string;
  type: 'access';
  iat: number;
};

export type RefreshTokenPayload = {
  userId: string;
  sessionId: string;
  type: 'refresh';
};

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'type' | 'iat'>) =>
  jwt.sign({ ...payload, type: 'access' }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });

export const signRefreshToken = (
  payload: Omit<RefreshTokenPayload, 'type'>,
  absoluteExpiresAt?: Date,
) => {
  // Cap the JWT exp at the session's absolute expiry so that even if
  // the DB record is bypassed, the token self-expires at the right time.
  const defaultTtlMs = parseDurationToMs(env.REFRESH_TOKEN_EXPIRES_IN);
  const defaultExp = Date.now() + defaultTtlMs;
  const expiresAtMs = absoluteExpiresAt ? Math.min(absoluteExpiresAt.getTime(), defaultExp) : defaultExp;
  const expiresInSeconds = Math.floor((expiresAtMs - Date.now()) / 1000);

  return jwt.sign({ ...payload, type: 'refresh' }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: expiresInSeconds,
    algorithm: 'HS256',
  });
};

/** Parse a duration string like "7d", "24h", "30m" into milliseconds. */
function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(d|h|m|s)$/.exec(duration);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const value = Number(match[1]);
  switch (match[2]) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET, {
    algorithms: ['HS256'],
  }) as AccessTokenPayload;

  if (payload.type !== 'access') {
    throw new Error('Invalid access token type');
  }

  return payload;
};

export const verifyRefreshToken = (token: string) => {
  const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
    algorithms: ['HS256'],
  }) as RefreshTokenPayload;

  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }

  return payload;
};
