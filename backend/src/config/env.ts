import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? (process.env.JWT_SECRET as string),
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? (process.env.JWT_SECRET as string),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '10m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME ?? 'ticketlabs_access',
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME ?? 'ticketlabs_refresh',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174',
};

export const ACCESS_TOKEN_MAX_AGE_MS = 10 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS =
  Number(process.env.REFRESH_TOKEN_ABSOLUTE_DAYS ?? 30) * 24 * 60 * 60 * 1000;

export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const validateSecret = (secret: string, keyName: string) => {
  const looksPlaceholder = secret.toLowerCase().includes('replace-with');
  const tooShort = secret.length < 32;

  if ((looksPlaceholder || tooShort) && env.NODE_ENV === 'production') {
    throw new Error(`${keyName} must be a strong secret (>=32 chars) in production`);
  }
};

validateSecret(env.ACCESS_TOKEN_SECRET, 'ACCESS_TOKEN_SECRET');
validateSecret(env.REFRESH_TOKEN_SECRET, 'REFRESH_TOKEN_SECRET');
