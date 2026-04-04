import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { getMe, login, signup } from '@/lib/auth';
import FullPageLoader from '@/components/FullPageLoader';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_cancelled: 'Google sign-in was cancelled.',
  oauth_failed: 'Google sign-in failed. Please try again.',
  email_not_verified: 'Your Google account email is not verified.',
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDraggingToggle, setIsDraggingToggle] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const toggleTrackRef = useRef<HTMLDivElement | null>(null);
  const toggleDragStartXRef = useRef(0);
  const toggleDidMoveRef = useRef(false);
  const suppressToggleClickRef = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setErrorMessage(OAUTH_ERROR_MESSAGES[oauthError] ?? 'Authentication failed. Please try again.');
    }
  }, [searchParams]);

  // Reset the Google button if the page is restored from bfcache
  // (user clicked Google, then hit the browser back button).
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsGoogleLoading(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // If context says user is logged in, verify with the server before redirecting.
  // This catches stale state from bfcache, SPA navigation after logout, etc.
  const hasVerifiedRef = useRef(false);
  useEffect(() => {
    if (isLoading || !user || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    setIsVerifying(true);
    getMe()
      .then((profile) => setUser(profile))
      .catch(() => setUser(null))
      .finally(() => setIsVerifying(false));
  }, [isLoading, user, setUser]);

  // While the global auth check or server verification is in progress, show the loader.
  if (isLoading || isVerifying) return <FullPageLoader label="Checking session..." />;

  // Genuinely authenticated — redirect to dashboard.
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check terms agreement for signup
    if (!isLogin && !agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        const { user: loggedInUser } = await login({
            email: formData.email,
            password: formData.password,
          });
        setUser(loggedInUser);
      } else {
        const { user: createdUser } = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          });
        setUser(createdUser);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to authenticate right now';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateToggleFromPointer = (clientX: number) => {
    if (!toggleTrackRef.current) return;

    const rect = toggleTrackRef.current.getBoundingClientRect();
    const normalized = (clientX - rect.left) / rect.width;
    const nextProgress = Math.min(1, Math.max(0, normalized));
    setDragProgress(nextProgress);
  };

  const handleTogglePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    e.preventDefault();
    setIsDraggingToggle(true);
    toggleDragStartXRef.current = e.clientX;
    toggleDidMoveRef.current = false;
    suppressToggleClickRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleTogglePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingToggle) return;

    const movedEnough = Math.abs(e.clientX - toggleDragStartXRef.current) > 6;
    if (!toggleDidMoveRef.current && !movedEnough) return;

    toggleDidMoveRef.current = true;
    updateToggleFromPointer(e.clientX);
  };

  const handleTogglePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingToggle) return;

    if (toggleDidMoveRef.current) {
      const progress = dragProgress ?? (isLogin ? 0 : 1);
      setIsLogin(progress < 0.5);
      suppressToggleClickRef.current = true;
    }

    setDragProgress(null);
    setIsDraggingToggle(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const sliderProgress = dragProgress ?? (isLogin ? 0 : 1);

  return (
    <div className="min-h-screen w-full bg-offwhite relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-dark/[0.04] blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-[34rem] rounded-full bg-lime/10 blur-3xl" />
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full border border-dark/10" />
        <div className="absolute -bottom-32 right-10 h-96 w-96 rounded-full border border-dark/10" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-offwhite/80 bg-offwhite/50 backdrop-blur-xl p-5 md:p-6 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="font-heading font-bold text-dark text-2xl leading-tight">
              {isLogin ? 'Welcome back' : 'Join The Backstage'}
            </h1>
            <p className="mt-1 text-sm text-dark/60">
              {isLogin ? 'Sign in to your workspace' : 'Create your professional workspace account'}
            </p>
          </div>

          {/* Form Tabs */}
          <div
            ref={toggleTrackRef}
            className="relative mb-6 grid grid-cols-2 items-center rounded-lg border border-dark/10 bg-offwhite/90 p-1 select-none touch-none"
            onPointerDown={handleTogglePointerDown}
            onPointerMove={handleTogglePointerMove}
            onPointerUp={handleTogglePointerEnd}
            onPointerCancel={handleTogglePointerEnd}
          >
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-lime/90 shadow-sm will-change-transform ${isDraggingToggle ? '' : 'transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]'}`}
              style={{ transform: `translateX(${sliderProgress * 100}%)` }}
            />

            <button
              type="button"
              onClick={() => {
                if (suppressToggleClickRef.current) {
                  suppressToggleClickRef.current = false;
                  return;
                }
                setDragProgress(null);
                setIsLogin(true);
              }}
              className={`relative z-10 py-2 text-sm font-medium transition-colors duration-200 ${isLogin ? 'text-dark' : 'text-dark/60 hover:text-dark'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                if (suppressToggleClickRef.current) {
                  suppressToggleClickRef.current = false;
                  return;
                }
                setDragProgress(null);
                setIsLogin(false);
              }}
              className={`relative z-10 py-2 text-sm font-medium transition-colors duration-200 ${!isLogin ? 'text-dark' : 'text-dark/60 hover:text-dark'}`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Name Field - Only for Signup */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-xs font-semibold tracking-wide text-dark/80 mb-1.5 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={18} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Brian O'Conner"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold tracking-wide text-dark/80 mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold tracking-wide text-dark/80 mb-1.5 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Only for Signup */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold tracking-wide text-dark/80 mb-1.5 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Forgot Password - Only for Login */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-dark/60 hover:text-dark transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Terms Agreement - Only for Signup */}
            {!isLogin && (
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-dark/20 text-lime focus:ring-lime focus:ring-2 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-dark/70 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a
                    href="/docs/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a
                    href="/docs/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!isLogin && !agreedToTerms)}
              className="w-full btn-primary py-2.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-dark/10" />
            <span className="text-xs text-dark/40 font-medium">or</span>
            <div className="flex-1 h-px bg-dark/10" />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={() => {
              setIsGoogleLoading(true);
              window.location.replace(`${API_BASE_URL}/api/auth/google`);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2.5 rounded-lg border border-dark/20 bg-offwhite/90 px-4 py-2.5 text-sm font-medium text-dark hover:bg-dark/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <svg className="w-4 h-4 animate-spin text-dark/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Additional Info */}
          <div className="mt-5 text-center text-sm text-dark/65">
            <span className="inline-flex items-center gap-1.5">
              {isLogin ? 'No account yet?' : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-dark hover:underline"
              >
                {isLogin ? 'Sign up free' : 'Log in'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
