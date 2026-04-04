import bcrypt from 'bcryptjs';
import { type Request, type Response, Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import {
  ACCESS_TOKEN_MAX_AGE_MS,
  env,
  PASSWORD_RESET_TOKEN_TTL_MS,
  REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../config/env.js';
import { sendPasswordResetEmail } from '../lib/email.js';
import { prisma } from '../lib/prisma.js';
import { generatePasswordResetToken, hashPasswordResetToken } from '../lib/password-reset.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { forgotPasswordRateLimiter, resetPasswordRateLimiter } from '../middleware/rate-limit.js';

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
  const session = await prisma.refreshSession.create({
    data: {
      userId: params.userId,
      familyId: params.familyId,
      tokenHash: '',
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
      absoluteExpiresAt: params.absoluteExpiresAt ?? new Date(Date.now() + REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS),
    },
    select: {
      id: true,
    },
  });

  const refreshToken = signRefreshToken({
    userId: params.userId,
    sessionId: session.id,
  });

  const tokenHash = await bcrypt.hash(refreshToken, 12);

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: { tokenHash },
  });

  const accessToken = signAccessToken({
    userId: params.userId,
    email: params.email,
  });

  return { accessToken, refreshToken, sessionId: session.id };
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

authRouter.post('/signup', async (req, res) => {
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

  const tokens = await issueSessionTokens({ userId: user.id, email: user.email });
  setAuthCookies(res, tokens);

  return res.status(201).json({ user });
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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

  const tokens = await issueSessionTokens({ userId: user.id, email: user.email });
  setAuthCookies(res, tokens);

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
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
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user });
});

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const session = await prisma.refreshSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (
      !session ||
      session.userId !== payload.userId ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.absoluteExpiresAt <= new Date()
    ) {
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

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
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

    return res.status(200).json({ message: 'Password reset email sent. Check your inbox.' });
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Failed to process forgot password request', error);
    }
    return res.status(503).json({ message: 'Unable to send password reset email right now. Please try again.' });
  }
});

authRouter.post('/password/reset', resetPasswordRateLimiter, async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  try {
    const prismaWithReset = prisma as typeof prisma & {
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
      };
    };

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
        data: { passwordHash: nextPasswordHash },
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

// GET /google — redirect to Google consent screen
authRouter.get('/google', (req, res) => {
  // Prevent authenticated users from initiating a new OAuth flow
  if (isAuthenticated(req)) {
    return res.redirect(`${env.FRONTEND_URL}/dashboard`);
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ message: 'Google OAuth is not configured' });
  }

  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });

  return res.redirect(authUrl);
});

// GET /google/callback — handle Google's redirect
authRouter.get('/google/callback', async (req, res) => {
  // Prevent authenticated users from processing OAuth callback
  // (e.g., when they navigate back in browser history)
  if (isAuthenticated(req)) {
    return res.redirect(`${env.FRONTEND_URL}/dashboard`);
  }

  const { code, error } = req.query;

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

    if (!user) {
      // New user — create account
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name ?? email.split('@')[0],
          googleId,
          passwordHash: null,
        },
      });
    } else if (!user.googleId) {
      // Existing email/password account — link Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
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
