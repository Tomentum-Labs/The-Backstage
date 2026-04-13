export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
};

type AuthResponse = {
  user: AuthUser;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const FETCH_TIMEOUT_MS = 15_000;

const fetchWithTimeout = (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const getJson = async <T>(response: Response): Promise<T> => {
  let body: Record<string, unknown> | null = null;
  try {
    body = await response.json();
  } catch {
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    throw new Error('Unexpected response format from server');
  }

  if (!response.ok) {
    throw new Error((body as { message?: string })?.message ?? `Request failed (${response.status})`);
  }

  return body as T;
};

// Singleton in-flight guard: concurrent callers share the same refresh request
// so the refresh token is only consumed once.
let refreshInFlight: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  if (!refreshInFlight) {
    refreshInFlight = fetchWithTimeout(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Session expired');
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

export const signup = async (payload: { name: string; email: string; password: string }) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, email: payload.email.toLowerCase().trim() }),
  });

  return getJson<AuthResponse>(response);
};

export const login = async (payload: { email: string; password: string }) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, email: payload.email.toLowerCase().trim() }),
  });

  return getJson<AuthResponse>(response);
};

export const getMe = async () => {
  let response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401) {
    await refreshSession();

    response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
    });

    // If still 401 after a successful refresh, the session is truly gone
    if (response.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const result = await getJson<{ user: AuthUser }>(response);
  return result.user;
};

export const logout = async () => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  return getJson<{ message: string }>(response);
};

export const requestPasswordReset = async (payload: { email: string }) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/password/forgot`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: payload.email.toLowerCase().trim() }),
  });

  return getJson<{ message: string }>(response);
};

export const resetPassword = async (payload: { token: string; password: string }) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/password/reset`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return getJson<{ message: string }>(response);
};

export const resendVerificationEmail = async (payload: { email: string }) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/email/resend`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: payload.email.toLowerCase().trim() }),
  });

  return getJson<{ message: string }>(response);
};

export const validateResetToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/auth/password/reset/validate?token=${encodeURIComponent(token)}`,
      { credentials: 'include' },
    );
    const body = await response.json().catch(() => ({}));
    return response.ok && (body as { valid?: boolean })?.valid === true;
  } catch {
    return false;
  }
};
