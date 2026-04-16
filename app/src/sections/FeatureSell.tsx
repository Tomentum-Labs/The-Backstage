import { useEffect, useRef, useState } from 'react';
import { Palette, Link2, Zap, Store, CreditCard, QrCode } from 'lucide-react';

const FeatureSell = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const bullets = [
    {
      icon: Palette,
      title: 'Custom styled checkout embeds',
      description: 'Keep fans on your site with widgets that perfectly match your brand colors.',
    },
    {
      icon: Link2,
      title: 'High conversion social links',
      description: 'Optimized, 1-click checkout URLs designed for sharing.',
    },
    {
      icon: Zap,
      title: 'Lightning fast Box Office POS',
      description: 'A dedicated, high speed interface for gate staff to process walk-in sales in seconds.',
    },
  ];

  return (
    <section ref={sectionRef} className="w-full bg-offwhite py-16 lg:py-24">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Block (Left) */}
          <div
            className={`lg:w-1/2 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
          >
            <h2
              className="font-heading font-bold text-dark mb-6"
              style={{ fontSize: 'clamp(23px, 2.4vw, 40px)' }}
            >
              Sell tickets everywhere
            </h2>
            <p className="text-dark/70 text-base sm:text-lg leading-relaxed mb-8">
              From your custom website to the front gate. Manage online drops and in-person sales from one unified dashboard.
            </p>

            {/* Bullets */}
            <ul className="space-y-4 mb-8">
              {bullets.map((bullet, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-4 transition-all duration-600 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <bullet.icon size={16} className="text-dark" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark">{bullet.title}</div>
                    <div className="text-dark/60 text-sm">{bullet.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tickets Display (Right) */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none h-[320px] sm:h-[400px]">
              {/* Ticket 1 - Back */}
              <div
                className={`absolute transition-all duration-700 delay-200 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } w-[72%] sm:w-[320px]`}
                style={{
                  top: '0px',
                  left: '2%',
                  transform: 'rotate(-5deg)',
                  zIndex: 1,
                }}
              >
                <img
                  src="/ticket_3_converted.avif"
                  alt="Festival Ticket"
                  className="w-full drop-shadow-xl"
                />
              </div>

              {/* Ticket 2 - Middle */}
              <div
                className={`absolute transition-all duration-700 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } w-[70%] sm:w-[300px]`}
                style={{
                  top: '22%',
                  right: '0px',
                  transform: 'rotate(3deg)',
                  zIndex: 2,
                }}
              >
                <img
                  src="/ticket_1_converted.avif"
                  alt="Standard Ticket"
                  className="w-full drop-shadow-xl"
                />
              </div>

              {/* Ticket 3 - Front */}
              <div
                className={`absolute transition-all duration-700 delay-400 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } w-[66%] sm:w-[280px]`}
                style={{
                  top: '45%',
                  left: '14%',
                  transform: 'rotate(-2deg)',
                  zIndex: 3,
                }}
              >
                <img
                  src="/ticket_2_converted.avif"
                  alt="VIP Ticket"
                  className="w-full drop-shadow-2xl"
                />
              </div>

              {/* Checkout UI Card */}
              <div
                className={`absolute bg-white rounded-2xl shadow-card p-4 transition-all duration-700 delay-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } w-[52%] min-w-[170px] sm:w-[200px]`}
                style={{
                  right: '4%',
                  bottom: '4%',
                  zIndex: 4,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
                    <Store size={16} className="text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Box Office POS</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-dark/60">
                    <CreditCard size={14} />
                    <span>Card + Tap</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark/60">
                    <QrCode size={14} />
                    <span>Instant ticket QR</span>
                  </div>
                </div>
              </div>

              {/* Decorative */}
              <div 
                className="absolute w-20 h-20 bg-lime/30 rounded-2xl -z-0"
                style={{ bottom: '0px', left: '0px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSell;
