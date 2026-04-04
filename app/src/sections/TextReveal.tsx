import React, { useEffect, useRef } from 'react';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─── Mobile: stagger fade-in via IntersectionObserver ────────────────────────
const MobileTextReveal: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const items = linesRef.current;

    // Prime every item: hidden, shifted down
    items.forEach((el) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'none';
    });

    const reveal = () => {
      items.forEach((el, i) => {
        if (!el) return;
        setTimeout(() => {
          el.style.transition = 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, i * 110);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="md:hidden w-full bg-dark pt-24 pb-20 relative overflow-x-hidden"
    >
      {/* Ghost text */}
      <div className="absolute inset-x-0 top-1/4 flex items-start justify-center pointer-events-none select-none">
        <span
          className="font-heading font-black whitespace-nowrap"
          style={{
            fontSize: 'clamp(44px, 18vw, 110px)',
            WebkitTextStroke: '1px rgba(255,255,255,0.10)',
            color: 'transparent',
            letterSpacing: '-0.04em',
          }}
        >
          OWN THE SHOW
        </span>
      </div>

      {/* Lime orb */}
      <div
        className="absolute rounded-full bg-lime blur-3xl pointer-events-none"
        style={{ right: '-8%', top: '6%', width: 140, height: 140, opacity: 0.13 }}
      />

      <div className="relative w-full max-w-[92%] mx-auto px-2">
        {/* Line 1 */}
        <div ref={(el) => { linesRef.current[0] = el; }} className="leading-none mb-1">
          <h2
            className="font-heading font-black text-left tracking-tight"
            style={{ fontSize: 'clamp(34px, 9vw, 60px)', color: 'rgba(255,255,255,0.15)' }}
          >
            Your events.
          </h2>
        </div>

        {/* Line 2 */}
        <div ref={(el) => { linesRef.current[1] = el; }} className="leading-none mb-1 text-center">
          <h2
            className="font-heading font-black text-white tracking-tight"
            style={{ fontSize: 'clamp(34px, 9vw, 60px)' }}
          >
            Your{' '}
            <span className="bg-lime text-dark px-2 rounded-xl" style={{ display: 'inline-block' }}>
              revenue.
            </span>
          </h2>
        </div>

        {/* Line 3 */}
        <div ref={(el) => { linesRef.current[2] = el; }} className="leading-none mb-1 text-right">
          <h2
            className="font-heading font-black tracking-tight"
            style={{ fontSize: 'clamp(34px, 9vw, 60px)', color: 'rgba(255,255,255,0.15)' }}
          >
            Your audience.
          </h2>
        </div>

        {/* Line 4 */}
        <div ref={(el) => { linesRef.current[3] = el; }} className="leading-none">
          <h2
            className="font-heading font-black text-white text-left tracking-tight"
            style={{ fontSize: 'clamp(34px, 9vw, 60px)' }}
          >
            Zero cuts.
          </h2>
        </div>

        {/* Progress line */}
        <div ref={(el) => { linesRef.current[4] = el; }} className="mt-16 relative">
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-px bg-lime absolute top-0 left-0" style={{ width: '55%' }} />
        </div>

        {/* Tagline */}
        <div ref={(el) => { linesRef.current[5] = el; }} className="mt-5 flex flex-col gap-3">
          <p className="font-body" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)' }}>
            No platform fees. No revenue splits. Just you, your fans, and your tickets.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-lime" />
            <span className="font-heading font-bold text-white text-sm tracking-tight">
              The Backstage
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Desktop: smooth parallax ─────────────────────────────────────────────────
const DesktopTextReveal: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const animRef = useRef<number>(0);
  const smooth = useRef(0);
  const target = useRef(0);

  const ghostRef = useRef<HTMLDivElement>(null);
  const orbTRRef = useRef<HTMLDivElement>(null);
  const orbBLRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const line4Ref = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressWrapRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calc = () => {
      if (!sectionRef.current) return;
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      target.current = Math.min(
        Math.max(-(top + height / 2 - vh / 2) / (vh * 0.55), -1.2),
        1.2
      );
    };

    const tick = () => {
      smooth.current = lerp(smooth.current, target.current, 0.1);
      const s = smooth.current;

      if (ghostRef.current)
        ghostRef.current.style.transform = `translateY(${s * -18}px) translateZ(0)`;
      if (orbTRRef.current)
        orbTRRef.current.style.transform = `translateY(${s * 120}px) translateZ(0)`;
      if (orbBLRef.current)
        orbBLRef.current.style.transform = `translateY(${s * -100}px) translateZ(0)`;
      if (line1Ref.current)
        line1Ref.current.style.transform = `translateY(${s * -90}px) translateZ(0)`;
      if (line2Ref.current)
        line2Ref.current.style.transform = `translateY(${s * -25}px) translateZ(0)`;
      if (pillRef.current)
        pillRef.current.style.transform = `rotate(${s * -1.5}deg) translateZ(0)`;
      if (line3Ref.current)
        line3Ref.current.style.transform = `translateY(${s * 25}px) translateZ(0)`;
      if (line4Ref.current)
        line4Ref.current.style.transform = `translateY(${s * 90}px) translateZ(0)`;
      if (progressWrapRef.current)
        progressWrapRef.current.style.transform = `translateY(${s * 20}px) translateZ(0)`;
      if (progressLineRef.current) {
        const lp = Math.min(Math.max((s + 1.2) / 2.4, 0), 1);
        progressLineRef.current.style.width = `${lp * 100}%`;
      }
      if (taglineRef.current)
        taglineRef.current.style.transform = `translateY(${s * 14}px) translateZ(0)`;

      animRef.current = requestAnimationFrame(tick);
    };

    const section = sectionRef.current!;
    const onMouseMove = (e: MouseEvent) => {
      if (!glowRef.current || !ghostRef.current) return;
      const rect = ghostRef.current.getBoundingClientRect();
      glowRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      glowRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    const onMouseLeave = () => {
      glowRef.current?.style.setProperty('--mx', '-9999px');
      glowRef.current?.style.setProperty('--my', '-9999px');
    };

    window.addEventListener('scroll', calc, { passive: true });
    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);
    calc();
    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', calc);
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hidden md:block w-full bg-dark pt-24 pb-64 lg:pt-48 lg:pb-64 relative overflow-hidden"
    >
      {/* Ghost background text */}
      <div
        ref={ghostRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none will-change-transform"
      >
        {/* Base: dim stroke */}
        <span
          className="font-heading font-black whitespace-nowrap"
          style={{
            fontSize: 'clamp(48px, 16vw, 220px)',
            WebkitTextStroke: '1px rgba(255,255,255,0.09)',
            color: 'transparent',
            letterSpacing: '-0.04em',
          }}
        >
          OWN THE SHOW
        </span>
        {/* Cursor glow: only the stroke lights up near cursor, no fill */}
        <span
          ref={glowRef}
          className="font-heading font-black whitespace-nowrap"
          style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(48px, 16vw, 220px)',
            color: 'transparent',
            letterSpacing: '-0.04em',
            WebkitTextStroke: '1.5px #B8FF3D',
            filter: 'drop-shadow(0 0 5px #B8FF3D) drop-shadow(0 0 16px rgba(184,255,61,0.55))',
            WebkitMaskImage: 'radial-gradient(ellipse 220px 140px at var(--mx, -9999px) var(--my, -9999px), black 10%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse 220px 140px at var(--mx, -9999px) var(--my, -9999px), black 10%, transparent 75%)',
          } as React.CSSProperties}
        >
          OWN THE SHOW
        </span>
      </div>

      {/* Lime orb top-right */}
      <div
        ref={orbTRRef}
        className="absolute rounded-full bg-lime blur-3xl pointer-events-none will-change-transform"
        style={{
          right: '-5%',
          top: '5%',
          width: 'clamp(140px, 18vw, 280px)',
          height: 'clamp(140px, 18vw, 280px)',
          opacity: 0.18,
        }}
      />

      {/* Lime orb bottom-left */}
      <div
        ref={orbBLRef}
        className="absolute rounded-full bg-lime blur-3xl pointer-events-none will-change-transform"
        style={{
          left: '-3%',
          bottom: '5%',
          width: 'clamp(70px, 10vw, 180px)',
          height: 'clamp(70px, 10vw, 180px)',
          opacity: 0.12,
        }}
      />

      <div className="relative w-full max-w-[92%] lg:max-w-[1300px] mx-auto px-2 lg:px-4">

        <div ref={line1Ref} className="leading-none mb-1 lg:mb-3 will-change-transform">
          <h2
            className="font-heading font-black text-left tracking-tight"
            style={{ fontSize: 'clamp(32px, 7.2vw, 105px)', color: 'rgba(255,255,255,0.12)' }}
          >
            Your events.
          </h2>
        </div>

        <div ref={line2Ref} className="leading-none mb-1 lg:mb-3 text-center will-change-transform">
          <h2
            className="font-heading font-black text-white tracking-tight"
            style={{ fontSize: 'clamp(32px, 7.2vw, 105px)' }}
          >
            Your{' '}
            <span
              ref={pillRef}
              className="bg-lime text-dark px-2 lg:px-5 rounded-xl lg:rounded-[28px] will-change-transform"
              style={{ display: 'inline-block' }}
            >
              revenue.
            </span>
          </h2>
        </div>

        <div ref={line3Ref} className="leading-none mb-1 lg:mb-3 text-right will-change-transform">
          <h2
            className="font-heading font-black tracking-tight"
            style={{ fontSize: 'clamp(32px, 7.2vw, 105px)', color: 'rgba(255,255,255,0.12)' }}
          >
            Your audience.
          </h2>
        </div>

        <div ref={line4Ref} className="leading-none will-change-transform">
          <h2
            className="font-heading font-black text-white text-left tracking-tight"
            style={{ fontSize: 'clamp(32px, 7.2vw, 105px)' }}
          >
            Zero cuts.
          </h2>
        </div>

        <div ref={progressWrapRef} className="mt-8 lg:mt-20 relative will-change-transform">
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div
            ref={progressLineRef}
            className="h-px bg-lime absolute top-0 left-0 will-change-transform"
            style={{ width: '0%' }}
          />
        </div>

        <div
          ref={taglineRef}
          className="mt-5 lg:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4 will-change-transform"
        >
          <p
            className="font-body"
            style={{ fontSize: 'clamp(12px, 1.3vw, 16px)', color: 'rgba(255,255,255,0.32)', maxWidth: '28rem' }}
          >
            No platform fees. No revenue splits. Just you, your fans, and your tickets.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-lime" />
            <span className="font-heading font-bold text-white text-sm lg:text-base tracking-tight">
              The Backstage
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Exports both, Tailwind breakpoint toggles visibility ─────────────────────
const TextReveal: React.FC = () => (
  <>
    <MobileTextReveal />
    <DesktopTextReveal />
  </>
);

export default TextReveal;