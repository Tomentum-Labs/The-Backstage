import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { resetPassword, validateResetToken } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validation';
import FullPageLoader from '@/components/FullPageLoader';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validate token on page load so we show an error state before the user fills in the form
  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }

    let cancelled = false;
    validateResetToken(token)
      .then((valid) => { if (!cancelled) setTokenState(valid ? 'valid' : 'invalid'); })
      .catch(() => { if (!cancelled) setTokenState('invalid'); });

    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetPassword({ token, password });
      setSuccessMessage(response.message);
      window.setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reset password.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenState === 'checking') {
    return <FullPageLoader label="Validating reset link..." />;
  }

  if (tokenState === 'invalid') {
    return (
      <div className="min-h-screen w-full bg-offwhite relative overflow-hidden flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-dark/[0.04] blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-offwhite/80 bg-offwhite/50 backdrop-blur-xl p-6 shadow-xl text-center">
          <h1 className="font-heading font-bold text-dark text-2xl leading-tight">Link expired</h1>
          <p className="mt-3 text-sm text-dark/60">
            This reset link is invalid or has already been used. Please request a new one.
          </p>
          <Link
            to="/auth/forgot-password"
            className="mt-5 inline-block w-full btn-primary py-2.5 font-semibold text-sm text-center"
          >
            Request a new link
          </Link>
          <p className="mt-4 text-sm text-dark/65">
            <Link to="/auth" className="font-semibold text-dark hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-offwhite relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-dark/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-offwhite/80 bg-offwhite/50 backdrop-blur-xl p-6 shadow-xl">
        <h1 className="font-heading font-bold text-dark text-2xl leading-tight text-center">Set a new password</h1>
        <p className="mt-2 text-sm text-dark/60 text-center">
          Choose a strong password with at least 8 characters, one uppercase, one lowercase, and one number.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-lime/40 bg-lime/10 px-3 py-2 text-sm text-dark">
              {successMessage}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-xs font-semibold tracking-wide text-dark/80 mb-1.5 uppercase">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errorMessage) setErrorMessage('');
                  if (successMessage) setSuccessMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

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
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (errorMessage) setErrorMessage('');
                  if (successMessage) setSuccessMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-2.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating password...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-dark/65">
          <Link to="/auth" className="font-semibold text-dark hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
