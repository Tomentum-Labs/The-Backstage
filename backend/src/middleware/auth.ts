import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../lib/jwt.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[env.ACCESS_COOKIE_NAME] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
