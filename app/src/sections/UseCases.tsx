import { useEffect, useRef, useState } from 'react';
import { Building2, Music, Palette, ArrowUpRight } from 'lucide-react';

const UseCases = () => {
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

  const useCases = [
    {
      icon: Building2,
      title: 'Venues',
      description: 'Recurring shows, memberships, reserved seating.',
      image: '/venue_theater.jpg',
      stats: { events: '50+', capacity: '2,500' },
    },
    {
      icon: Music,
      title: 'Festivals',
      description: 'Multi-day passes, tiers, add-ons.',
      image: '/festival_outdoor.jpg',
      stats: { events: '12+', capacity: '50,000' },
    },
    {
      icon: Palette,
      title: 'Creators',
      description: 'Classes, drops, private events.',
      image: '/creator_workshop.jpg',
      stats: { events: '100+', capacity: '100' },
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-offwhite py-24"
      id="usecases"
    >
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        {/* Heading */}
        <div className="text-center mb-20 relative z-50">
          <h2
            className={`font-heading font-bold text-dark mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(34px, 3.6vw, 52px)' }}
          >
            Built for your world
          </h2>
          <p
            className={`text-dark/70 text-lg max-w-2xl mx-auto transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Whether you run a single venue, a multi-day festival, or create one-off experiences, our flexible platform can handle your unique needs.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl overflow-hidden shadow-card transition-all duration-700 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
              style={{
                height: '380px',
                transitionDelay: `${(i + 1) * 100}ms`,
              }}
            >
              {/* Background Image */}
              <img
                src={useCase.image}
                alt={useCase.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-lime flex items-center justify-center transition-all duration-600 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                    }`}
                    style={{ transitionDelay: `${(i + 2) * 100}ms` }}
                  >
                    <useCase.icon size={24} className="text-dark" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={20} className="text-white" />
                  </div>
                </div>

                {/* Bottom */}
                <div>
                  <h3 className="font-heading font-bold text-2xl text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {useCase.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
                      <div className="text-white font-semibold text-sm">{useCase.stats.events}</div>
                      <div className="text-white/50 text-xs">Events</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
                      <div className="text-white font-semibold text-sm">{useCase.stats.capacity}</div>
                      <div className="text-white/50 text-xs">Capacity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
