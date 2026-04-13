import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[env.ACCESS_COOKIE_NAME] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    const payload = verifyAccessToken(token);

    // Check if access tokens were revoked after a password reset.
    // Only query if the field might be set (non-null shortcut impossible without caching,
    // so we always check — one DB read per authenticated request).
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { accessTokenRevokedAt: true },
    });

    if (user?.accessTokenRevokedAt) {
      // payload.iat is seconds since epoch (JWT standard)
      const iatMs = payload.iat * 1000;
      if (iatMs < user.accessTokenRevokedAt.getTime()) {
        return res.status(401).json({ message: 'Session invalidated. Please sign in again.' });
      }
    }

    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
