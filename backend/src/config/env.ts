import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'DATABASE_URL',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'TOKEN_HMAC_SECRET',
  'OAUTH_STATE_SECRET',
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  TOKEN_HMAC_SECRET: process.env.TOKEN_HMAC_SECRET as string,
  OAUTH_STATE_SECRET: process.env.OAUTH_STATE_SECRET as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '10m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME ?? 'thebackstage_access',
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME ?? 'thebackstage_refresh',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/api/auth/google/callback',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'The Backstage <no-reply@send.thebkstg.com>',
  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL ?? `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/auth/reset-password`,
  PASSWORD_RESET_TOKEN_TTL_MINUTES: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? 30),
  EMAIL_VERIFICATION_URL: process.env.EMAIL_VERIFICATION_URL ?? `http://localhost:${process.env.PORT ?? 4000}/api/auth/email/verify`,
  EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES ?? 60),
};

export const ACCESS_TOKEN_MAX_AGE_MS = 10 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS =
  Number(process.env.REFRESH_TOKEN_ABSOLUTE_DAYS ?? 30) * 24 * 60 * 60 * 1000;

export const PASSWORD_RESET_TOKEN_TTL_MS = env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000;
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000;

export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .filter((origin) => {
    try {
      new URL(origin);
      return true;
    } catch {
      console.warn(`[cors] Ignoring malformed origin in CORS_ORIGIN: "${origin}"`);
      return false;
    }
  });

const validateSecret = (secret: string, keyName: string) => {
  const looksPlaceholder = secret.toLowerCase().includes('replace-with');
  const tooShort = secret.length < 32;

  if ((looksPlaceholder || tooShort) && env.NODE_ENV === 'production') {
    throw new Error(`${keyName} must be a strong secret (>=32 chars) in production`);
  }
};

validateSecret(env.ACCESS_TOKEN_SECRET, 'ACCESS_TOKEN_SECRET');
validateSecret(env.REFRESH_TOKEN_SECRET, 'REFRESH_TOKEN_SECRET');
validateSecret(env.TOKEN_HMAC_SECRET, 'TOKEN_HMAC_SECRET');
validateSecret(env.OAUTH_STATE_SECRET, 'OAUTH_STATE_SECRET');

if (!Number.isFinite(env.PASSWORD_RESET_TOKEN_TTL_MINUTES) || env.PASSWORD_RESET_TOKEN_TTL_MINUTES <= 0) {
  throw new Error('PASSWORD_RESET_TOKEN_TTL_MINUTES must be a positive number');
}

if (!Number.isFinite(env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES) || env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES <= 0) {
  throw new Error('EMAIL_VERIFICATION_TOKEN_TTL_MINUTES must be a positive number');
}
