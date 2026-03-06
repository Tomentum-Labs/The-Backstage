import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { getMe, login, signup } from '@/lib/auth';
import FullPageLoader from '@/components/FullPageLoader';

const MIN_LOADER_DURATION_MS = 200;

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
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
    const checkSession = async () => {
      const startedAt = Date.now();

      try {
        await getMe();
        navigate('/dashboard', { replace: true });
      } catch {
        // no active session, keep auth page
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_LOADER_DURATION_MS - elapsed);

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        setIsCheckingSession(false);
      }
    };

    void checkSession();
  }, [navigate]);

  if (isCheckingSession) {
    return <FullPageLoader label="Checking session..." />;
  }

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
        await login({
            email: formData.email,
            password: formData.password,
          });
      } else {
        await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          });
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
              {isLogin ? 'Welcome back' : 'Join Ticket Labs'}
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
