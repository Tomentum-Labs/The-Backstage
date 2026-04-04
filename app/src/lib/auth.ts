export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AuthResponse = {
  user: AuthUser;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const getJson = async <T>(response: Response): Promise<T> => {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.message ?? 'Request failed');
  }

  return body as T;
};

// Singleton in-flight guard: concurrent callers share the same refresh request
// so the refresh token is only consumed once.
let refreshInFlight: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/api/auth/refresh`, {
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
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return getJson<AuthResponse>(response);
};

export const login = async (payload: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return getJson<AuthResponse>(response);
};

export const getMe = async () => {
  let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401) {
    await refreshSession();

    response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
    });
  }

  const result = await getJson<{ user: AuthUser }>(response);
  return result.user;
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  return getJson<{ message: string }>(response);
};
