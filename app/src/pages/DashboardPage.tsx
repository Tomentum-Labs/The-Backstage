import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout, type AuthUser } from '@/lib/auth';
import FullPageLoader from '@/components/FullPageLoader';

const MIN_LOADER_DURATION_MS = 200;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const startedAt = Date.now();

      try {
        const profile = await getMe();
        setUser(profile);
      } catch {
        navigate('/auth', { replace: true });
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_LOADER_DURATION_MS - elapsed);

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        setLoading(false);
      }
    };

    void loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout API errors and still redirect
    }
    navigate('/auth', { replace: true });
  };

  if (loading) {
    return <FullPageLoader label="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-dark/10 bg-offwhite/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-dark/60">Dashboard</p>
              <h1 className="text-3xl font-heading text-dark">Welcome to Ticket Labs</h1>
            </div>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="card-modern">
            <p className="text-sm text-dark/60">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-dark">{loading ? 'Loading...' : user?.email ?? '—'}</p>
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
          {!loading && user && (
            <p className="mt-4 text-sm text-dark/60">Account holder: {user.name}</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
