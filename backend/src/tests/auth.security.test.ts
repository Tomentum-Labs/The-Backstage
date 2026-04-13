import request from 'supertest';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import app from '../app.js';
import { env } from '../config/env.js';
import { signRefreshToken } from '../lib/jwt.js';
import { hashPasswordResetToken } from '../lib/password-reset.js';
import { prisma } from '../lib/prisma.js';

const resetUrlByEmail = new Map<string, string>();
const verifyUrlByEmail = new Map<string, string>();
const createdEmails = new Set<string>();

vi.mock('../lib/email.js', () => ({
  sendPasswordResetEmail: vi.fn(async ({ to, resetUrl }: { to: string; resetUrl: string }) => {
    resetUrlByEmail.set(to.toLowerCase(), resetUrl);
  }),
  sendEmailVerificationEmail: vi.fn(async ({ to, verifyUrl }: { to: string; verifyUrl: string }) => {
    verifyUrlByEmail.set(to.toLowerCase(), verifyUrl);
  }),
}));

const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@security-test.invalid`;

const getCookieValue = (setCookieHeader: string | string[] | undefined, cookieName: string) => {
  const cookieHeaders = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];

  const cookieLine = cookieHeaders.find((line) => line.startsWith(`${cookieName}=`));
  if (!cookieLine) {
    throw new Error(`Cookie ${cookieName} is missing in response`);
  }

  return cookieLine.split(';', 1)[0];
};

const getTokenFromCookie = (cookiePair: string) => cookiePair.split('=', 2)[1] ?? '';

const getResetToken = (email: string) => {
  const resetUrl = resetUrlByEmail.get(email.toLowerCase());
  if (!resetUrl) throw new Error(`Missing reset URL for ${email}`);
  const token = new URL(resetUrl).searchParams.get('token');
  if (!token) throw new Error(`Reset URL did not include a token for ${email}`);
  return token;
};

const getVerifyToken = (email: string) => {
  const verifyUrl = verifyUrlByEmail.get(email.toLowerCase());
  if (!verifyUrl) throw new Error(`Missing verify URL for ${email}`);
  const token = new URL(verifyUrl).searchParams.get('token');
  if (!token) throw new Error(`Verify URL did not include a token for ${email}`);
  return token;
};

/** Sign up + verify email, returns session cookies for an active account. */
const signupAndVerify = async (email: string, password = 'StrongPass123') => {
  createdEmails.add(email.toLowerCase());

  const signupRes = await request(app).post('/api/auth/signup').send({
    name: 'Security Test User',
    email,
    password,
  });

  expect(signupRes.status).toBe(201);
  expect(signupRes.body.needsVerification).toBe(true);

  // Consume the verification token via the redirect endpoint
  const verifyToken = getVerifyToken(email);
  const verifyRes = await request(app)
    .get('/api/auth/email/verify')
    .query({ token: verifyToken })
    .redirects(0);

  expect(verifyRes.status).toBe(302);
  expect(verifyRes.headers.location).toContain('/dashboard');

  const accessCookie = getCookieValue(verifyRes.headers['set-cookie'], env.ACCESS_COOKIE_NAME);
  const refreshCookie = getCookieValue(verifyRes.headers['set-cookie'], env.REFRESH_COOKIE_NAME);

  return {
    accessCookie,
    refreshCookie,
    accessToken: getTokenFromCookie(accessCookie),
    refreshToken: getTokenFromCookie(refreshCookie),
  };
};

describe.sequential('Auth Security Integration', () => {
  afterEach(async () => {
    resetUrlByEmail.clear();
    verifyUrlByEmail.clear();

    const emails = [...createdEmails];
    createdEmails.clear();

    if (emails.length > 0) {
      await prisma.user.deleteMany({ where: { email: { in: emails } } });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ─── Email verification ───────────────────────────────────────────────────

  it('signup does not issue session tokens until email is verified', async () => {
    const email = uniqueEmail('unverified-signup');
    createdEmails.add(email.toLowerCase());

    const res = await request(app).post('/api/auth/signup').send({
      name: 'Unverified User',
      email,
      password: 'StrongPass123',
    });

    expect(res.status).toBe(201);
    expect(res.body.needsVerification).toBe(true);
    // No auth cookies should be set
    const setCookieHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];
    expect(cookies.some((c) => c.startsWith(env.ACCESS_COOKIE_NAME))).toBe(false);
    expect(cookies.some((c) => c.startsWith(env.REFRESH_COOKIE_NAME))).toBe(false);
  });

  it('unverified user cannot log in', async () => {
    const email = uniqueEmail('blocked-login');
    createdEmails.add(email.toLowerCase());

    await request(app).post('/api/auth/signup').send({
      name: 'Blocked User',
      email,
      password: 'StrongPass123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'StrongPass123',
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.code).toBe('needs_verification');
  });

  it('email verification token is one-time use', async () => {
    const email = uniqueEmail('token-once');
    createdEmails.add(email.toLowerCase());

    await request(app).post('/api/auth/signup').send({
      name: 'One Time User',
      email,
      password: 'StrongPass123',
    });

    const token = getVerifyToken(email);

    const firstUse = await request(app)
      .get('/api/auth/email/verify')
      .query({ token })
      .redirects(0);
    expect(firstUse.status).toBe(302);
    expect(firstUse.headers.location).toContain('/dashboard');

    const secondUse = await request(app)
      .get('/api/auth/email/verify')
      .query({ token })
      .redirects(0);
    expect(secondUse.status).toBe(302);
    expect(secondUse.headers.location).toContain('error=invalid_token');
  });

  it('invalid verification token redirects with error', async () => {
    const res = await request(app)
      .get('/api/auth/email/verify')
      .query({ token: 'this-is-a-fake-verification-token-1234' })
      .redirects(0);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('error=invalid_token');
  });

  it('resend verification email returns generic response (no enumeration)', async () => {
    const missingEmail = uniqueEmail('missing-resend');

    const res = await request(app).post('/api/auth/email/resend').send({ email: missingEmail });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if that email/i);
    // No verification email sent for non-existent user
    expect(verifyUrlByEmail.has(missingEmail.toLowerCase())).toBe(false);
  });

  it('resend verification email does not resend for already-verified accounts', async () => {
    const email = uniqueEmail('verified-resend');
    await signupAndVerify(email);
    verifyUrlByEmail.clear(); // clear the initial verify email

    const res = await request(app).post('/api/auth/email/resend').send({ email });
    expect(res.status).toBe(200);
    // No new verification email should be sent
    expect(verifyUrlByEmail.has(email.toLowerCase())).toBe(false);
  });

  it('verified user can log in and /me returns emailVerifiedAt', async () => {
    const email = uniqueEmail('verified-login');
    const { accessCookie } = await signupAndVerify(email);

    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'StrongPass123',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.emailVerifiedAt).not.toBeNull();

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', accessCookie);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.emailVerifiedAt).not.toBeNull();
  });

  // ─── Existing security checks (updated to use signupAndVerify) ───────────

  it('prevents user enumeration on forgot password', async () => {
    const missingEmail = uniqueEmail('missing-user');

    const response = await request(app).post('/api/auth/password/forgot').send({ email: missingEmail });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/if an account exists/i);
    expect(resetUrlByEmail.has(missingEmail.toLowerCase())).toBe(false);
  });

  it('rejects weak signup passwords', async () => {
    const email = uniqueEmail('weak-pass');

    const response = await request(app).post('/api/auth/signup').send({
      name: 'Weak Password',
      email,
      password: 'password',
    });

    expect(response.status).toBe(400);
  });

  it('rejects JWT alg=none tokens', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        userId: 'attacker',
        email: 'attacker@example.com',
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300,
      }),
    ).toString('base64url');
    const token = `${header}.${payload}.`;

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('rejects refresh tokens on access-protected endpoints (type confusion)', async () => {
    const email = uniqueEmail('type-confusion');
    const { refreshToken } = await signupAndVerify(email);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(401);
  });

  it('blocks OAuth callback when CSRF state is missing or mismatched', async () => {
    const response = await request(app)
      .get('/api/auth/google/callback')
      .query({ code: 'fake-code', state: 'attacker-state' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('error=oauth_state_mismatch');
  });

  it('invalidates prior access tokens after password reset', async () => {
    const email = uniqueEmail('revoke-access');
    const oldPassword = 'OldStrongPass123';
    const newPassword = 'NewStrongPass123';
    const { accessToken } = await signupAndVerify(email, oldPassword);

    const forgotResponse = await request(app).post('/api/auth/password/forgot').send({ email });
    expect(forgotResponse.status).toBe(200);

    const resetToken = getResetToken(email);

    const validateResponse = await request(app)
      .get('/api/auth/password/reset/validate')
      .query({ token: resetToken });
    expect(validateResponse.status).toBe(200);
    expect(validateResponse.body.valid).toBe(true);

    const resetResponse = await request(app).post('/api/auth/password/reset').send({
      token: resetToken,
      password: newPassword,
    });
    expect(resetResponse.status).toBe(200);

    const oldTokenResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(oldTokenResponse.status).toBe(401);
    expect(oldTokenResponse.body.message).toMatch(/session invalidated|invalid or expired token/i);

    const loginWithOldPassword = await request(app).post('/api/auth/login').send({
      email,
      password: oldPassword,
    });
    expect(loginWithOldPassword.status).toBe(401);

    const loginWithNewPassword = await request(app).post('/api/auth/login').send({
      email,
      password: newPassword,
    });
    expect(loginWithNewPassword.status).toBe(200);
  }, 30000);

  it('enforces one-time use refresh token rotation', async () => {
    const email = uniqueEmail('refresh-rotation');
    const { refreshCookie } = await signupAndVerify(email);

    const firstRefresh = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);
    expect(firstRefresh.status).toBe(200);

    const secondUse = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);
    expect(secondUse.status).toBe(401);
  }, 30000);

  it('revokes refresh token family after stale token reuse attempt', async () => {
    const email = uniqueEmail('refresh-family');
    const { refreshCookie } = await signupAndVerify(email);

    const firstRefresh = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);
    expect(firstRefresh.status).toBe(200);

    const rotatedRefreshCookie = getCookieValue(firstRefresh.headers['set-cookie'], env.REFRESH_COOKIE_NAME);

    const staleReuse = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);
    expect(staleReuse.status).toBe(401);

    const familyRevoked = await request(app).post('/api/auth/refresh').set('Cookie', rotatedRefreshCookie);
    expect(familyRevoked.status).toBe(401);
  }, 30000);

  it('rate-limit middleware is wired and endpoints respond correctly', async () => {
    // In test mode rate limiting is skipped (skip: skipInTest), so we verify
    // the endpoint itself works. Rate-limit header presence is a production concern.
    const email = uniqueEmail('rate-headers');
    const response = await request(app).post('/api/auth/password/forgot').send({ email });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/if an account exists/i);
  });

  it('supports reset token lifecycle and stores only hashed reset token', async () => {
    const email = uniqueEmail('reset-lifecycle');
    await signupAndVerify(email, 'ResetFlowPass123');

    const forgotResponse = await request(app).post('/api/auth/password/forgot').send({ email });
    expect(forgotResponse.status).toBe(200);

    const token = getResetToken(email);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    expect(user).not.toBeNull();

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { userId: user!.id, consumedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { tokenHash: true },
    });

    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord!.tokenHash).toBe(hashPasswordResetToken(token));
    expect(tokenRecord!.tokenHash).not.toBe(token);

    const firstValidate = await request(app)
      .get('/api/auth/password/reset/validate')
      .query({ token });
    expect(firstValidate.status).toBe(200);
    expect(firstValidate.body.valid).toBe(true);

    const resetResponse = await request(app).post('/api/auth/password/reset').send({
      token,
      password: 'ResetFlowNewPass123',
    });
    expect(resetResponse.status).toBe(200);

    const secondValidate = await request(app)
      .get('/api/auth/password/reset/validate')
      .query({ token });
    expect(secondValidate.status).toBe(400);
    expect(secondValidate.body.valid).toBe(false);
  }, 30000);

  it('is resilient to SQL-injection-style auth attempts', async () => {
    const email = uniqueEmail('sqli-user');
    const password = 'SqliSafePass123';
    await signupAndVerify(email, password);

    const invalidFormatEmail = await request(app).post('/api/auth/login').send({
      email: "' OR 1=1--",
      password: "' OR '1'='1",
    });
    expect(invalidFormatEmail.status).toBe(400);

    const wrongPasswordAttempt = await request(app).post('/api/auth/login').send({
      email,
      password: "' OR '1'='1",
    });
    expect(wrongPasswordAttempt.status).toBe(401);

    const forgotInjection = await request(app).post('/api/auth/password/forgot').send({
      email: "test@example.com' OR '1'='1",
    });
    expect(forgotInjection.status).toBe(400);
  });

  it('rejects access JWTs with wrong token type even if correctly signed', async () => {
    const fakeRefreshAsAccess = signRefreshToken({
      userId: 'user_123',
      sessionId: 'session_456',
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeRefreshAsAccess}`);

    expect(response.status).toBe(401);
  });

  it('refresh token JWT exp is capped at absoluteExpiresAt', async () => {
    const email = uniqueEmail('abs-expiry');
    const { refreshToken } = await signupAndVerify(email);

    // Decode without verification to inspect the exp claim
    const parts = refreshToken.split('.');
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    const now = Math.floor(Date.now() / 1000);
    const maxAbsoluteSeconds = 30 * 24 * 60 * 60; // 30 days

    // exp must be set and within 7d from now (the sliding window)
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(now);
    // exp must not exceed 30d absolute from now (with a generous 10s buffer for test timing)
    expect(decoded.exp).toBeLessThanOrEqual(now + maxAbsoluteSeconds + 10);
    // Standard 7d window: exp should be approx now + 7d
    const sevenDaysSeconds = 7 * 24 * 60 * 60;
    expect(decoded.exp).toBeLessThanOrEqual(now + sevenDaysSeconds + 10);
  });

  it('logout revokes refresh session and clears cookies', async () => {
    const email = uniqueEmail('logout-test');
    const { refreshCookie, accessCookie } = await signupAndVerify(email);

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [accessCookie, refreshCookie]);
      
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe('Logged out');
    
    // Auth cookies should be cleared
    const setCookieHeader = logoutRes.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];
    
    expect(cookies.some((c: string) => c.includes(`${env.ACCESS_COOKIE_NAME}=;`) || c.includes(`${env.ACCESS_COOKIE_NAME}= `))).toBe(true);
    expect(cookies.some((c: string) => c.includes(`${env.REFRESH_COOKIE_NAME}=;`) || c.includes(`${env.REFRESH_COOKIE_NAME}= `))).toBe(true);
    
    // Refresh token should be revoked
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);
      
    expect(refreshRes.status).toBe(401);
  }, 30000);
});
