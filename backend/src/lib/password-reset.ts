import crypto from 'node:crypto';

export const generatePasswordResetToken = () => crypto.randomBytes(32).toString('base64url');

export const hashPasswordResetToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
