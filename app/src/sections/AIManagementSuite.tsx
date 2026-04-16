import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const agents = [
  {
    avatar: '/AITeam/marketing.avif',
    name: 'Grace',
    title: 'AI Marketing Co-Pilot',
    description: 'Your promo copy, written and targeted before your morning coffee.',
  },
  {
    avatar: '/AITeam/customer_support.avif',
    name: 'Nova',
    title: '24/7 Customer Support Bot',
    description: 'Attendees get instant answers. You get your evenings back.',
  },
  {
    avatar: '/AITeam/fraud.avif',
    name: 'Rex',
    title: 'Fraud & Scalper Detection',
    description: 'Bots and scalpers blocked silently, before they do any damage.',
  },
  {
    avatar: '/AITeam/post_event.avif',
    name: 'Cyrus',
    title: 'Post-Event AI Analyst',
    description: 'Wake up to a full event report. No spreadsheets, no manual work.',
  },
  {
    avatar: '/AITeam/sponsor_matchmake.avif',
    name: 'Zara',
    title: 'Sponsor Matchmaking',
    description: 'The right sponsors, perfect verified venues found automatically.',
  },
  {
    avatar: '/AITeam/planner.avif',
    name: 'Ella',
    title: 'Smart Logistics Planner',
    description: 'Tell it your goals. Get back a pricing, capacity, and timeline plan.',
  },
];

const N = agents.length;

type SizeMap = Record<0 | 1 | 2, { w: number; h: number; opacity: number }>;

// Desktop sizes
const DESKTOP = {
  sizes: {
    0: { w: 260, h: 340, opacity: 1    },
    1: { w: 130, h: 170, opacity: 0.55 },
    2: { w: 80,  h: 105, opacity: 0.28 },
  } as SizeMap,
  gap: 18,
};

// Mobile sizes — slimmer, show 3 cards (center + 1 each side)
const MOBILE = {
  sizes: {
    0: { w: 190, h: 250, opacity: 1    },
    1: { w: 88,  h: 116, opacity: 0.5  },
    2: { w: 56,  h: 74,  opacity: 0.22 },
  } as SizeMap,
  gap: 12,
};

function getDist(i: number, active: number): number {
  let d = i - active;
  if (d >  N / 2) d -= N;
  if (d < -N / 2) d += N;
  return d;
}

function getX(dist: number, sizes: SizeMap, gap: number): number {
  const abs = Math.abs(dist);
  const s   = Math.sign(dist);
  const c = sizes[0].w, a = sizes[1].w, f = sizes[2].w;
  if (abs === 0) return 0;
  if (abs === 1) return s * (c / 2 + gap + a / 2);
  if (abs === 2) return s * (c / 2 + gap + a + gap + f / 2);
  return s * (c / 2 + gap + a + gap + f + gap + 80);
}

const EASING = 'cubic-bezier(0.4,0,0.2,1)';
const DUR    = '0.55s';

const AIManagementSuite = () => {
  const sectionRef    = useRef<HTMLElement>(null);
  const stripRef      = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [active, setActive]       = useState(0);
  const [prevActive, setPrevActive] = useState(0);
  const [paused, setPaused]       = useState(false);
  const isMobile                  = useIsMobile();

  // Touch state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const config = isMobile ? MOBILE : DESKTOP;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const go = useCallback((next: number) => {
    setPrevActive(active);
    setActive(next);
  }, [active]);

  const prev = useCallback(() => go((active - 1 + N) % N), [go, active]);
  const next = useCallback(() => go((active + 1) % N),     [go, active]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 3500);
    return () => clearInterval(id);
  }, [paused, next]);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal swipe is dominant and exceeds threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    // Resume auto-play after a pause
    setTimeout(() => setPaused(false), 4000);
  }, [next, prev]);

  const { sizes, gap } = config;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-offwhite py-16 lg:py-24 overflow-hidden"
      id="ai-management-suite"
    >
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">

        {/* Heading */}
        <div className="text-center mb-14">
          <h2
            className={`font-heading font-bold text-dark mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(26px, 3vw, 48px)' }}
          >
            Meet your new Virtual Team
          </h2>
          <p
            className={`text-dark/70 text-base sm:text-lg max-w-3xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Stop hiring massive teams for manual tasks. Our integrated AI Event Management Suite handles the heavy lifting so you can focus on the experience.
          </p>
        </div>

        {/* Carousel */}
        <div
          className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          onMouseEnter={() => !isMobile && setPaused(true)}
          onMouseLeave={() => !isMobile && setPaused(false)}
        >
          {/* Strip */}
          <div
            ref={stripRef}
            className="relative overflow-hidden"
            style={{ height: sizes[0].h + 48, marginBottom: 4 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="absolute inset-0 flex items-end justify-center">
              {agents.map((agent, i) => {
                const dist     = getDist(i, active);
                const prevDist = getDist(i, prevActive);
                const absD     = Math.abs(dist);
                const slot     = sizes[Math.min(absD, 2) as 0 | 1 | 2];
                const x        = getX(dist, sizes, gap);
                const visible  = absD <= 2;
                const wasVisible = Math.abs(prevDist) <= 2;
                const animate    = visible && wasVisible;

                const transition = animate
                  ? `width ${DUR} ${EASING}, height ${DUR} ${EASING}, opacity ${DUR} ${EASING}, transform ${DUR} ${EASING}`
                  : 'none';

                return (
                  <button
                    key={i}
                    onClick={() => { go(i); setPaused(true); }}
                    className="absolute bottom-8 focus:outline-none"
                    style={{
                      width:         slot.w,
                      height:        slot.h,
                      opacity:       visible ? slot.opacity : 0,
                      zIndex:        visible ? 10 - absD : 0,
                      transform:     `translateX(${x}px)`,
                      pointerEvents: visible ? 'auto' : 'none',
                      transition,
                    }}
                  >
                    <div className="w-full h-full overflow-hidden" style={{ borderRadius: 22 }}>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-full h-full object-cover object-top"
                        draggable={false}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent name */}
          <div className="relative text-center mb-1" style={{ height: 28 }}>
            {agents.map((agent, i) => (
              <div
                key={agent.name}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity:       i === active ? 1 : 0,
                  pointerEvents: i === active ? 'auto' : 'none',
                  transition:    'opacity 0.4s ease',
                }}
              >
                <p
                  className="font-semibold text-dark/60 text-xl tracking-wide"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {agent.name}
                </p>
              </div>
            ))}
          </div>

          {/* Title + description */}
          <div className="relative mx-auto max-w-lg text-center px-4">
            {agents.map((agent, i) => (
              <div
                key={agent.title}
                className="absolute inset-0 flex flex-col items-center"
                style={{
                  opacity:       i === active ? 1 : 0,
                  transform:     i === active ? 'translateY(0px)' : 'translateY(10px)',
                  pointerEvents: i === active ? 'auto' : 'none',
                  transition:    'opacity 0.45s ease, transform 0.45s ease',
                }}
              >
                <h3
                  className="font-heading font-bold text-dark text-xl sm:text-2xl mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {agent.title}
                </h3>
                <p className="text-dark/70 text-sm sm:text-base leading-relaxed">{agent.description}</p>
              </div>
            ))}
            <div className="invisible" aria-hidden>
              <h3 className="font-heading font-bold text-dark text-xl sm:text-2xl mb-2">{agents[0].title}</h3>
              <p className="text-dark/70 text-sm sm:text-base leading-relaxed">{agents[0].description}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => { prev(); setPaused(true); }}
              className="w-10 h-10 rounded-full border border-dark/15 bg-white flex items-center justify-center text-dark/60 hover:border-lime hover:text-dark transition-all duration-200 hover:shadow-md"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2 items-center">
              {agents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { go(i); setPaused(true); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:      i === active ? 24 : 8,
                    height:     8,
                    background: i === active ? 'hsl(78,100%,62%)' : 'rgba(0,0,0,0.15)',
                  }}
                  aria-label={`Go to ${agents[i].name}`}
                />
              ))}
            </div>

            <button
              onClick={() => { next(); setPaused(true); }}
              className="w-10 h-10 rounded-full border border-dark/15 bg-white flex items-center justify-center text-dark/60 hover:border-lime hover:text-dark transition-all duration-200 hover:shadow-md"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AIManagementSuite;
