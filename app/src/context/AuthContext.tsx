import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe, type AuthUser } from '@/lib/auth';

type AuthContextValue = {
  /** null = not authenticated, undefined = initial loading not done yet (unused externally) */
  user: AuthUser | null;
  /** true while the initial session check is still in flight */
  isLoading: boolean;
  /** call after login / signup / oauth to update the global user state */
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // One single session check for the entire app lifetime.
    // getMe() internally handles the access-token → refresh-token flow
    // so the refresh token is only rotated once on cold load.
    getMe()
      .then((profile) => setUser(profile))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
