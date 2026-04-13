import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const generatePasswordResetToken = () => crypto.randomBytes(32).toString('base64url');

export const hashPasswordResetToken = (token: string) =>
  crypto.createHmac('sha256', env.TOKEN_HMAC_SECRET).update(token).digest('hex');
