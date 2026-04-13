import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { type Request, type Response, Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import {
  ACCESS_TOKEN_MAX_AGE_MS,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  env,
  PASSWORD_RESET_TOKEN_TTL_MS,
  REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../config/env.js';
import { sendEmailVerificationEmail, sendPasswordResetEmail } from '../lib/email.js';
import { prisma } from '../lib/prisma.js';
import { generatePasswordResetToken, hashPasswordResetToken } from '../lib/password-reset.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import {
  forgotPasswordRateLimiter,
  loginPerEmailRateLimiter,
  refreshRateLimiter,
  resetPasswordRateLimiter,
  signupRateLimiter,
} from '../middleware/rate-limit.js';

const googleOAuth2Client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

const authRouter = Router();

const getAccessCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE_MS,
});

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REFRESH_TOKEN_MAX_AGE_MS,
});

const clearAuthCookies = (res: Response) => {
  res.clearCookie(env.ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

const issueSessionTokens = async (params: {
  userId: string;
  email: string;
  familyId?: string;
  absoluteExpiresAt?: Date;
}) => {
  const sessionId = crypto.randomUUID();

  const absoluteExpiresAt = params.absoluteExpiresAt ?? new Date(Date.now() + REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS);

  const refreshToken = signRefreshToken(
    { userId: params.userId, sessionId },
    absoluteExpiresAt,
  );

  const tokenHash = await bcrypt.hash(refreshToken, 12);

  await prisma.refreshSession.create({
    data: {
      id: sessionId,
      userId: params.userId,
      familyId: params.familyId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
      absoluteExpiresAt,
    },
  });

  const accessToken = signAccessToken({
    userId: params.userId,
    email: params.email,
  });

  return { accessToken, refreshToken, sessionId };
};

const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
  res.cookie(env.ACCESS_COOKIE_NAME, tokens.accessToken, getAccessCookieOptions());
  res.cookie(env.REFRESH_COOKIE_NAME, tokens.refreshToken, getRefreshCookieOptions());
};

/**
 * Check if the request has a valid authentication token.
 * Returns true if authenticated, false otherwise.
 */
const isAuthenticated = (req: Request): boolean => {
  const cookieToken = req.cookies?.[env.ACCESS_COOKIE_NAME] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) return false;

  try {
    verifyAccessToken(token);
    return true;
  } catch {
    return false;
  }
};

const getRequesterIp = (req: Request) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
  const ip = (firstForwarded ?? req.ip ?? '').trim();

  return ip ? ip.slice(0, 64) : null;
};

const getEmailVerificationUrl = (token: string) => {
  try {
    const url = new URL(env.EMAIL_VERIFICATION_URL);
    url.searchParams.set('token', token);
    return url.toString();
  } catch {
    const separator = env.EMAIL_VERIFICATION_URL.includes('?') ? '&' : '?';
    return `${env.EMAIL_VERIFICATION_URL}${separator}token=${encodeURIComponent(token)}`;
  }
};

const getPasswordResetUrl = (token: string) => {
  try {
    const resetUrl = new URL(env.PASSWORD_RESET_URL);
    resetUrl.searchParams.set('token', token);
    return resetUrl.toString();
  } catch {
    const separator = env.PASSWORD_RESET_URL.includes('?') ? '&' : '?';
    return `${env.PASSWORD_RESET_URL}${separator}token=${encodeURIComponent(token)}`;
  }
};

/** Creates a fresh EmailVerification record and sends the email. Fire-and-forget safe. */
const issueEmailVerification = async (userId: string, email: string) => {
  const rawToken = generatePasswordResetToken(); // same secure random bytes approach
  const tokenHash = hashPasswordResetToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TOKEN_TTL_MS);

  // Invalidate any outstanding tokens for this user first
  await prisma.emailVerification.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: now },
  });

  await prisma.emailVerification.create({
    data: { userId, tokenHash, expiresAt },
  });

  const verifyUrl = getEmailVerificationUrl(rawToken);
  await sendEmailVerificationEmail({ to: email, verifyUrl });
};

// Reusable Prisma cast for PasswordResetToken (model added via db push — Prisma type inference applies)
type PrismaWithReset = typeof prisma & {
  passwordResetToken: {
    findUnique: (...args: unknown[]) => Promise<
      | {
          id: string;
          userId: string;
          consumedAt: Date | null;
          expiresAt: Date;
        }
      | null
    >;
    updateMany: (...args: unknown[]) => Promise<{ count: number }>;
    create: (...args: unknown[]) => Promise<unknown>;
  };
};

const prismaWithReset = prisma as PrismaWithReset;

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(20),
  password: passwordSchema,
});

authRouter.post('/signup', signupRateLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  // Send verification email — do not issue session tokens until email is confirmed
  await issueEmailVerification(user.id, user.email);

  return res.status(201).json({
    message: 'Account created. Please check your email to verify your address.',
    needsVerification: true,
    email: user.email,
  });
});

authRouter.post('/login', loginPerEmailRateLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Block unverified accounts — prompt to resend
  if (!user.emailVerifiedAt) {
    return res.status(403).json({
      code: 'needs_verification',
      message: 'Please verify your email address before signing in.',
      email: user.email,
    });
  }

  const tokens = await issueSessionTokens({ userId: user.id, email: user.email });
  setAuthCookies(res, tokens);

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      emailVerifiedAt: user.emailVerifiedAt,
    },
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user });
});

authRouter.post('/refresh', refreshRateLimiter, async (req, res) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const now = new Date();

    const session = await prisma.refreshSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session || session.userId !== payload.userId) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh session' });
    }

    if (session.revokedAt || session.expiresAt <= now || session.absoluteExpiresAt <= now) {
      // A stale/reused refresh token indicates suspicious replay: revoke any still-active tokens in this family.
      await prisma.refreshSession.updateMany({
        where: {
          userId: session.userId,
          familyId: session.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh session' });
    }

    const isValidToken = await bcrypt.compare(refreshToken, session.tokenHash);

    if (!isValidToken) {
      await prisma.refreshSession.updateMany({
        where: {
          userId: session.userId,
          familyId: session.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const revokeResult = await prisma.refreshSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (revokeResult.count !== 1) {
      await prisma.refreshSession.updateMany({
        where: {
          userId: session.userId,
          familyId: session.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      clearAuthCookies(res);
      return res.status(401).json({ message: 'Refresh token already used' });
    }

    const tokens = await issueSessionTokens({
      userId: session.user.id,
      email: session.user.email,
      familyId: session.familyId,
      absoluteExpiresAt: session.absoluteExpiresAt,
    });

    setAuthCookies(res, tokens);

    return res.status(200).json({ message: 'Session refreshed' });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshSession.updateMany({
        where: {
          id: payload.sessionId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } catch {
      // noop
    }
  }

  clearAuthCookies(res);
  return res.status(200).json({ message: 'Logged out' });
});

authRouter.post('/password/forgot', forgotPasswordRateLimiter, async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const email = parsed.data.email.toLowerCase();

  // Always return the same message regardless of whether the email exists
  // to prevent user enumeration attacks
  const genericResponse = {
    message: "If an account exists with that email, you'll receive a reset link shortly.",
  };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MS);

    await prisma.$transaction(async (tx) => {
      const txWithReset = tx as typeof tx & {
        passwordResetToken: {
          updateMany: (...args: unknown[]) => Promise<{ count: number }>;
          create: (...args: unknown[]) => Promise<unknown>;
        };
      };

      await txWithReset.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          consumedAt: null,
        },
        data: {
          consumedAt: now,
        },
      });

      await txWithReset.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          requestedIp: getRequesterIp(req),
          requestedUserAgent: req.headers['user-agent']?.slice(0, 512) ?? null,
        },
      });
    });

    const resetUrl = getPasswordResetUrl(rawToken);
    await sendPasswordResetEmail({ to: user.email, resetUrl });

    return res.status(200).json(genericResponse);
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Failed to process forgot password request', error);
    }
    return res.status(503).json({ message: 'Unable to send password reset email right now. Please try again.' });
  }
});

// GET /password/reset/validate — lightweight token check before the user fills in the form
authRouter.get('/password/reset/validate', resetPasswordRateLimiter, async (req, res) => {
  const token = req.query.token;

  if (!token || typeof token !== 'string' || token.length < 20) {
    return res.status(400).json({ valid: false });
  }

  const tokenHash = hashPasswordResetToken(token);
  const resetToken = await prismaWithReset.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { consumedAt: true, expiresAt: true },
  });

  const valid = !!resetToken && !resetToken.consumedAt && resetToken.expiresAt > new Date();
  return res.status(valid ? 200 : 400).json({ valid });
});

authRouter.post('/password/reset', resetPasswordRateLimiter, async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  try {
    const tokenHash = hashPasswordResetToken(parsed.data.token);
    const resetToken = await prismaWithReset.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        consumedAt: true,
        expiresAt: true,
      },
    });

    if (!resetToken || resetToken.consumedAt || resetToken.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    const nextPasswordHash = await bcrypt.hash(parsed.data.password, 12);
    const now = new Date();

    const txResult = await prisma.$transaction(async (tx) => {
      const txWithReset = tx as typeof tx & {
        passwordResetToken: {
          updateMany: (...args: unknown[]) => Promise<{ count: number }>;
        };
      };

      const consumeResult = await txWithReset.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        data: { consumedAt: now },
      });

      if (consumeResult.count !== 1) {
        return { tokenConsumed: false as const };
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash: nextPasswordHash,
          // Invalidate all access tokens issued before this moment
          accessTokenRevokedAt: now,
        },
      });

      await tx.refreshSession.updateMany({
        where: {
          userId: resetToken.userId,
          revokedAt: null,
        },
        data: { revokedAt: now },
      });

      await txWithReset.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          consumedAt: null,
        },
        data: {
          consumedAt: now,
        },
      });

      return { tokenConsumed: true as const };
    });

    if (!txResult.tokenConsumed) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Failed to process reset password request', error);
    }
    return res.status(503).json({ message: 'Password reset is temporarily unavailable. Please try again later.' });
  }

  clearAuthCookies(res);
  return res.status(200).json({ message: 'Password reset successful. Please sign in again.' });
});

// GET /email/verify?token=... — consume the verification token and mark the user verified
authRouter.get('/email/verify', async (req, res) => {
  const token = req.query.token;

  if (!token || typeof token !== 'string' || token.length < 20) {
    return res.redirect(`${env.FRONTEND_URL}/auth/verify-email?error=invalid_token`);
  }

  const tokenHash = hashPasswordResetToken(token);
  const record = await prisma.emailVerification.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, consumedAt: true, expiresAt: true },
  });

  if (!record || record.consumedAt || record.expiresAt <= new Date()) {
    return res.redirect(`${env.FRONTEND_URL}/auth/verify-email?error=invalid_token`);
  }

  const now = new Date();

  const txResult = await prisma.$transaction(async (tx) => {
    const consumeResult = await tx.emailVerification.updateMany({
      where: { id: record.id, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    });

    if (consumeResult.count !== 1) return { ok: false as const };

    const user = await tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: now },
      select: { id: true, name: true, email: true, emailVerifiedAt: true, createdAt: true },
    });

    return { ok: true as const, user };
  });

  if (!txResult.ok) {
    return res.redirect(`${env.FRONTEND_URL}/auth/verify-email?error=invalid_token`);
  }

  const tokens = await issueSessionTokens({
    userId: txResult.user.id,
    email: txResult.user.email,
  });
  setAuthCookies(res, tokens);

  return res.redirect(`${env.FRONTEND_URL}/dashboard?verified=1`);
});

// POST /email/resend — resend a verification email for an unverified account
authRouter.post('/email/resend', forgotPasswordRateLimiter, async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const email = parsed.data.email.toLowerCase();

  // Always return the same response to prevent enumeration
  const genericResponse = {
    message: "If that email is registered and unverified, you'll receive a new verification link shortly.",
  };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });

    // No user, or already verified — return generic response either way
    if (!user || user.emailVerifiedAt) {
      return res.status(200).json(genericResponse);
    }

    await issueEmailVerification(user.id, user.email);
    return res.status(200).json(genericResponse);
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Failed to resend verification email', error);
    }
    return res.status(503).json({ message: 'Unable to resend verification email right now. Please try again.' });
  }
});

// GET /google — redirect to Google consent screen
authRouter.get('/google', (req, res) => {
  // Prevent authenticated users from initiating a new OAuth flow
  if (isAuthenticated(req)) {
    return res.redirect(`${env.FRONTEND_URL}/dashboard`);
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ message: 'Google OAuth is not configured' });
  }

  // Generate CSRF state token and store in signed httpOnly cookie
  const oauthState = crypto.randomBytes(32).toString('base64url');

  res.cookie('oauth_state', oauthState, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes — enough for the OAuth round-trip
    signed: true,
  });

  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
    state: oauthState,
  });

  return res.redirect(authUrl);
});

// GET /google/callback — handle Google's redirect
authRouter.get('/google/callback', async (req, res) => {
  // Prevent authenticated users from processing OAuth callback
  if (isAuthenticated(req)) {
    return res.redirect(`${env.FRONTEND_URL}/dashboard`);
  }

  const { code, error, state } = req.query;

  // Verify CSRF state — read and immediately clear the signed cookie
  const storedState = req.signedCookies?.oauth_state as string | undefined;
  res.clearCookie('oauth_state', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    signed: true,
  });

  if (!storedState || typeof state !== 'string' || storedState !== state) {
    return res.redirect(`${env.FRONTEND_URL}/auth?error=oauth_state_mismatch`);
  }

  if (error || !code || typeof code !== 'string') {
    return res.redirect(`${env.FRONTEND_URL}/auth?error=oauth_cancelled`);
  }

  try {
    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);

    if (!tokens.id_token) {
      return res.redirect(`${env.FRONTEND_URL}/auth?error=oauth_failed`);
    }

    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.redirect(`${env.FRONTEND_URL}/auth?error=oauth_failed`);

    const { sub: googleId, email, name, email_verified } = payload;

    if (!email_verified || !email) {
      return res.redirect(`${env.FRONTEND_URL}/auth?error=email_not_verified`);
    }

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email: email.toLowerCase() }] },
    });

    const now = new Date();

    if (!user) {
      // New user — create account. Google guarantees email_verified, so mark verified immediately.
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name ?? email.split('@')[0],
          googleId,
          passwordHash: null,
          emailVerifiedAt: now,
        },
      });
    } else if (!user.googleId) {
      // Existing email/password account — link Google and mark email verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, emailVerifiedAt: user.emailVerifiedAt ?? now },
      });
    } else if (!user.emailVerifiedAt) {
      // Existing Google account missing verification timestamp — backfill it
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: now },
      });
    }

    const sessionTokens = await issueSessionTokens({ userId: user.id, email: user.email });
    setAuthCookies(res, sessionTokens);
    return res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch {
    return res.redirect(`${env.FRONTEND_URL}/auth?error=oauth_failed`);
  }
});

export default authRouter;
