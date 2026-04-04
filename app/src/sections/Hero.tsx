import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const headlineWords = ['Your brand.', 'Your tickets.', 'One platform.'];

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-full bg-offwhite flex items-center justify-center relative overflow-hidden pt-20"
      id="hero"
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-lime/10 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-16 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content (Left on desktop) */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Headline */}
            <h1
              className={`font-heading font-bold text-dark leading-[0.95] tracking-tight mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
            >
              {headlineWords.map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-[0.3em]"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {word}
                </span>
              ))}
            </h1>

            {/* Subheadline */}
            <p
              className={`text-dark/70 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              A white label ticketing system that looks like you built it, without
              the engineering team.
            </p>

            {/* CTA Row */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 mb-6 justify-center lg:justify-start transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary flex items-center gap-2"
              >
                Get started free
                <ArrowRight size={18} />
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Play size={16} />
                See how it works
              </button>
            </div>

            {/* Badge */}
            <div
              className={`transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dark/20 text-sm text-dark/60 bg-offwhite-dark">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                AI Powered Event Management <span className="w-2 h-2 rounded-full bg-lime animate-pulse" /> Setup in minutes
              </span>
            </div>
          </div>

          {/* Stacked Images (Right on desktop) */}
          <div
            className={`lg:w-1/2 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative w-full max-w-lg mx-auto" style={{ height: '450px' }}>
              {/* Image 1 - Back */}
              <div 
                className="absolute img-rounded shadow-xl"
                style={{
                  width: '280px',
                  height: '200px',
                  top: '0px',
                  left: '0px',
                  transform: 'rotate(-8deg)',
                  zIndex: 1,
                }}
              >
                <img
                  src="/hero_3.jpg"
                  alt="Theater"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image 2 - Middle */}
              <div 
                className="absolute img-rounded shadow-xl"
                style={{
                  width: '260px',
                  height: '180px',
                  top: '60px',
                  right: '20px',
                  transform: 'rotate(5deg)',
                  zIndex: 2,
                }}
              >
                <img
                  src="/hero_2.jpg"
                  alt="Festival"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image 3 - Front */}
              <div 
                className="absolute img-rounded shadow-2xl"
                style={{
                  width: '300px',
                  height: '200px',
                  top: '180px',
                  left: '40px',
                  transform: 'rotate(-3deg)',
                  zIndex: 3,
                }}
              >
                <img
                  src="/hero_1.jpg"
                  alt="Concert"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image 4 - Front Right */}
              <div 
                className="absolute img-rounded shadow-xl"
                style={{
                  width: '240px',
                  height: '160px',
                  top: '260px',
                  right: '0px',
                  transform: 'rotate(8deg)',
                  zIndex: 4,
                }}
              >
                <img
                  src="/hero_4.jpg"
                  alt="Workshop"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements */}
              <div 
                className="absolute w-16 h-16 bg-lime rounded-xl -z-0"
                style={{ top: '20px', right: '0px' }}
              />
              <div 
                className="absolute w-12 h-12 border-2 border-dark/10 rounded-xl -z-0"
                style={{ bottom: '40px', left: '10px' }}
              />
              <div 
                className="absolute w-8 h-8 bg-lime/50 rounded-lg -z-0"
                style={{ bottom: '80px', right: '60px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
