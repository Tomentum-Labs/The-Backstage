import { useEffect, useRef, useState } from 'react';
import { Quote, Star } from 'lucide-react';

const SocialProof = () => {
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

  const logos = [
    'VenueX',
    'EventHub',
    'ShowTime',
    'TicketPro',
    'StageLab',
    'CrowdSync',
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-offwhite py-24"
    >
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        {/* Label */}
        <p
          className={`text-center text-xs font-medium tracking-[0.15em] uppercase text-dark/50 mb-12 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Trusted by event teams worldwide
        </p>

        {/* Logo Row */}
        <div
          className={`flex flex-wrap justify-center items-center gap-8 lg:gap-16 mb-20 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {logos.map((logo, i) => (
            <div
              key={i}
              className="font-heading font-bold text-2xl text-dark/20 hover:text-dark/40 transition-colors cursor-default"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {logo}
            </div>
          ))}
        </div>

        {/* Testimonial Card */}
        <div
          className={`mx-auto bg-white rounded-2xl shadow-card p-8 lg:p-12 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ maxWidth: '800px' }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-lime">
                <img
                  src="/avatar_testimonial.jpg"
                  alt="Amina K."
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Quote */}
            <div className="flex-1 text-center lg:text-left">
              <Quote className="w-10 h-10 text-lime mb-4 mx-auto lg:mx-0" />
              <p
                className={`font-heading font-semibold text-xl lg:text-2xl text-dark leading-snug mb-6 transition-all duration-700 delay-300 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                }`}
              >
                "We switched to Ticket Labs and sold out our venue in 48 hours—without a single support ticket."
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 justify-center lg:justify-start mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="text-lime fill-lime" />
                ))}
              </div>
              
              <div className="text-left">
                <p className="font-semibold text-dark">Amina K.</p>
                <p className="text-dark/60 text-sm">Program Director, VenueX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          className={`flex flex-wrap justify-center gap-12 mt-16 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="text-center">
            <div className="font-heading font-bold text-3xl text-dark">10K+</div>
            <div className="text-dark/60 text-sm">Events Hosted</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-3xl text-dark">2M+</div>
            <div className="text-dark/60 text-sm">Tickets Sold</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-3xl text-dark">99%</div>
            <div className="text-dark/60 text-sm">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
