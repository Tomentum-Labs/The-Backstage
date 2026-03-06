import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClosingCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

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

  const benefits = [
    'Free for 100 tickets',
    'No setup fees',
    'Cancel anytime',
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-dark py-24"
    >
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2
              className={`font-heading font-bold text-white mb-6 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ fontSize: 'clamp(34px, 3.6vw, 52px)' }}
            >
              Ready to launch your next event?
            </h2>
            <p
              className={`text-white/60 text-lg leading-relaxed mb-8 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Create your first event today. No code. No setup fees.
            </p>

            {/* Benefits */}
            <div
              className={`flex flex-wrap gap-4 mb-8 justify-center lg:justify-start transition-all duration-700 delay-350 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {benefits.map((benefit, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 text-sm text-white/70"
                >
                  <CheckCircle size={16} className="text-lime" />
                  {benefit}
                </span>
              ))}
            </div>

            {/* CTA Row */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary flex items-center gap-2"
              >
                Get started free
                <ArrowRight size={18} />
              </button>
              <button className="flex items-center gap-2 text-white font-medium hover:text-lime transition-colors group">
                <MessageCircle size={18} />
                Talk to sales
              </button>
            </div>
          </div>

          {/* Right - Stats Panel */}
          <div className="lg:w-1/2">
            <div
              className={`bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="font-heading font-bold text-4xl text-lime mb-2">10K+</div>
                  <div className="text-white/60 text-sm">Events Hosted</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-4xl text-lime mb-2">2M+</div>
                  <div className="text-white/60 text-sm">Tickets Sold</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-4xl text-lime mb-2">$50M+</div>
                  <div className="text-white/60 text-sm">Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="font-heading font-bold text-4xl text-lime mb-2">99.9%</div>
                  <div className="text-white/60 text-sm">Uptime</div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/70 text-sm italic mb-4">
                  "Ticket Labs transformed how we sell tickets. The white-label solution 
                  made it feel like our own platform."
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src="/avatar_testimonial.jpg"
                    alt="Customer"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-white text-sm font-medium">Sarah Johnson</div>
                    <div className="text-white/50 text-xs">Event Director, VenueX</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosingCTA;
