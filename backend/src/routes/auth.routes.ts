import bcrypt from 'bcryptjs';
import { type Request, type Response, Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import {
  ACCESS_TOKEN_MAX_AGE_MS,
  env,
  REFRESH_TOKEN_ABSOLUTE_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';

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

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
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
