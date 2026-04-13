import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
      setUser(null);
      navigate('/auth', { replace: true });
    } catch (error) {
      // Don't clear local state — session may still be active on server
      setLogoutError(error instanceof Error ? error.message : 'Logout failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-offwhite px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-dark/10 bg-offwhite/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-dark/60">Dashboard</p>
              <h1 className="text-3xl font-heading text-dark">Welcome to The Backstage</h1>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Log out
              </button>
              {logoutError && (
                <p className="text-xs text-red-600">{logoutError}</p>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-modern">
            <p className="text-sm text-dark/60">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-dark">{user?.email ?? '—'}</p>
          </article>
          <article className="card-modern">
            <p className="text-sm text-dark/60">Workspace status</p>
            <p className="mt-2 text-lg font-semibold text-dark">Active</p>
          </article>
          <article className="card-modern">
            <p className="text-sm text-dark/60">Current plan</p>
            <p className="mt-2 text-lg font-semibold text-dark">Starter</p>
          </article>
        </section>

        <section className="rounded-2xl border border-dark/10 bg-offwhite/80 p-6">
          <h2 className="text-xl font-heading text-dark">Mock Dashboard</h2>
          <p className="mt-2 text-dark/70">
            This is a placeholder dashboard screen. After signup/login, users land here with a verified JWT session.
          </p>
          {user && (
            <p className="mt-4 text-sm text-dark/60">Account holder: {user.name}</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
