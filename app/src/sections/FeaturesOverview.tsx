import { useEffect, useRef, useState } from 'react';
import { Zap, Mail, Headphones } from 'lucide-react';

const FeaturesOverview = () => {
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

  const features = [
    {
      icon: Zap,
      title: 'Fast checkout',
      description: 'Apple Pay, Google Pay, cards, guests are done in seconds.',
    },
    {
      icon: Mail,
      title: 'Instant delivery',
      description: 'QR codes + wallet passes, automatically.',
    },
    {
      icon: Headphones,
      title: 'Real-time support',
      description: '24/7 live chat and help when it matters.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-offwhite py-24"
      id="features"
    >
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        {/* Heading moved into right column */}

        {/* Content Grid - Image left, texts right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch lg:h-[420px]">
          {/* Image (Left) */}
          <div className={`lg:w-1/2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="w-full h-[260px] md:h-[320px] lg:h-[420px] rounded-2xl overflow-hidden shadow-card">
              <img src="/hero_1_converted.avif" alt="Features preview" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Texts (Right) - match image height; title moved here and aligned to image */}
          <div className={`lg:w-1/2 flex flex-col justify-start lg:h-[420px] px-2 lg:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <h2 className="font-heading font-bold text-dark mb-4" style={{ fontSize: 'clamp(28px, 2.4vw, 40px)' }}>
              Everything you need to sell tickets
            </h2>
            <p className="text-dark/70 text-lg leading-relaxed mb-6">Sell tickets online and at the door with a single unified system, fast checkout, instant delivery, and support when you need it.</p>

            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <feature.icon size={16} className="text-dark" />
                  </div>
                  <div>
                    <div className="font-semibold text-dark">{feature.title}</div>
                    <div className="text-dark/60 text-sm">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesOverview;
