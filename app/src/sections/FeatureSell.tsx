import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Globe, Share2, Store, ShoppingCart, CreditCard, QrCode } from 'lucide-react';

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
    { icon: Globe, text: 'Embeds that match your brand' },
    { icon: Share2, text: 'Social-friendly share links' },
    { icon: Store, text: 'Box office mode for walk-ups' },
  ];

  return (
    <section ref={sectionRef} className="w-full bg-offwhite py-24">
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Block (Left) */}
          <div
            className={`lg:w-1/2 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
            }`}
          >
            <h2
              className="font-heading font-bold text-dark mb-6"
              style={{ fontSize: 'clamp(28px, 2.4vw, 40px)' }}
            >
              Sell anywhere
            </h2>
            <p className="text-dark/70 text-lg leading-relaxed mb-8">
              Embed checkout on your site, share a link, or sell at the door.
              One system, every channel.
            </p>

            {/* Bullets */}
            <ul className="space-y-4 mb-8">
              {bullets.map((bullet, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 transition-all duration-600 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center flex-shrink-0">
                    <bullet.icon size={18} className="text-dark" />
                  </div>
                  <span className="text-dark/80">{bullet.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button className="flex items-center gap-2 text-dark font-medium hover:text-lime-dark transition-colors group">
              See sales tools
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
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
                  src="/ticket_3.png"
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
                  src="/ticket_1.png"
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
                  src="/ticket_2.png"
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
                    <ShoppingCart size={16} className="text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Quick Checkout</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-dark/60">
                    <CreditCard size={14} />
                    <span>Apple Pay</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark/60">
                    <QrCode size={14} />
                    <span>Instant QR</span>
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
