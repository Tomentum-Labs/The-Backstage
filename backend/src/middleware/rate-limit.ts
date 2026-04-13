import rateLimit from 'express-rate-limit';

// In test mode skip all rate limiting so tests aren't blocked by accumulated counts.
const skipInTest = () => process.env.NODE_ENV === 'test';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication requests. Please try again later.' },
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again later.' },
});

export const resetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Please try again later.' },
});

// Dedicated limiter for signup: tighter than the global auth limiter
export const signupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many signup attempts. Please try again later.' },
});

// Dedicated limiter for token refresh
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many session refresh attempts. Please try again later.' },
});

// Per-email login limiter: prevents targeted brute force from distributed IPs
export const loginPerEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    (req.body?.email ?? '').toString().toLowerCase().trim() || req.ip || 'unknown',
  message: { message: 'Too many login attempts for this account. Please try again later.' },
});
