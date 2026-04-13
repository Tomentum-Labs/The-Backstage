import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { resendVerificationEmail } from '@/lib/auth';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const error = searchParams.get('error');

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [customEmail, setCustomEmail] = useState(email);

  // Auto-resend on invalid_token error only if we have an email to resend to
  const autoResentRef = useRef(false);

  const handleResend = async (emailToResend: string) => {
    setResendMessage('');
    setResendError('');
    setIsResending(true);
    try {
      const response = await resendVerificationEmail({ email: emailToResend });
      setResendMessage(response.message);
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Unable to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (error === 'invalid_token' && email && !autoResentRef.current) {
      autoResentRef.current = true;
      void handleResend(email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExpiredOrInvalid = error === 'invalid_token';

  return (
    <div className="min-h-screen w-full bg-offwhite relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-dark/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-offwhite/80 bg-offwhite/50 backdrop-blur-xl p-6 shadow-xl">
        {isExpiredOrInvalid ? (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="text-red-500" size={40} />
            </div>
            <h1 className="font-heading font-bold text-dark text-2xl leading-tight text-center">
              Link expired or invalid
            </h1>
            <p className="mt-2 text-sm text-dark/60 text-center">
              This verification link has expired or already been used.{' '}
              {email ? 'We\'ve sent a fresh link to your email.' : 'Enter your email below to get a new one.'}
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Mail className="text-dark/70" size={40} />
                <CheckCircle className="absolute -bottom-1 -right-1 text-lime fill-lime" size={18} />
              </div>
            </div>
            <h1 className="font-heading font-bold text-dark text-2xl leading-tight text-center">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm text-dark/60 text-center">
              We sent a verification link to{' '}
              {email ? (
                <span className="font-medium text-dark">{email}</span>
              ) : (
                'your email address'
              )}
              . Click it to activate your account.
            </p>
          </>
        )}

        {resendMessage && (
          <div className="mt-4 rounded-lg border border-lime/40 bg-lime/10 px-3 py-2 text-sm text-dark">
            {resendMessage}
          </div>
        )}

        {resendError && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {resendError}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {/* If no email in URL, show an input so the user can request a resend */}
          {!email && (
            <div>
              <label htmlFor="resend-email" className="block text-xs font-semibold tracking-wide text-dark/80 mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={18} />
                <input
                  id="resend-email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-dark/20 bg-offwhite/90 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-lime/70 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isResending || (!email && !customEmail)}
            onClick={() => void handleResend(email || customEmail)}
            className="w-full btn-primary py-2.5 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-dark/65">
          <Link to="/auth" className="font-semibold text-dark hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
