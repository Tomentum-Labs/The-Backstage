import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const JoinWaitlist = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <section
      id="waitlist"
      ref={sectionRef}
      className="relative w-full min-h-screen py-24 overflow-hidden flex items-center"
      style={{
        backgroundImage: "url('/waitlist_background_converted.avif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-dark/55" />
      <div className="absolute -top-20 -left-16 w-72 h-72 bg-lime/20 blur-3xl" />
      <div className="absolute -bottom-16 -right-10 w-80 h-80 bg-white/10 blur-3xl" />

      <div className="relative w-full max-w-4xl mx-auto px-6 lg:px-12">
        <div className="space-y-6">
          <div
            className={`text-center transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2
              className="font-heading font-bold text-white mb-4"
              style={{ fontSize: 'clamp(32px, 3.8vw, 52px)' }}
            >
              Join the waitlist
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
              Be first in line to launch with The Backstage. We will notify you as soon as your access is ready.
            </p>
          </div>

          <div
            className={`relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 backdrop-blur-2xl p-6 sm:p-8 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5 pointer-events-none" />

            {status === 'success' ? (
              <div className="relative flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-lime/20 border border-lime/40">
                  <CheckCircle className="text-lime" size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white font-semibold text-xl mb-1">You're on the list!</p>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                    Thanks for joining. We'll notify you with updates as soon as your access is ready.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative">
                <label htmlFor="waitlist-email" className="block text-sm font-medium text-white mb-2">
                  Enter email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="you@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full rounded-xl border border-white/20 bg-dark/30 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-lime/50 disabled:opacity-50"
                />
                {status === 'error' && (
                  <p className="mt-2 text-sm text-red-400">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Joining…
                    </>
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <p className="mt-3 text-xs text-white/60">
                  No spam. Product updates only.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinWaitlist;
