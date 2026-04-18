import { useEffect, useRef, useState } from 'react';

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

  return (
    <section
      ref={sectionRef}
      className="w-full md:min-h-screen flex items-center justify-center pt-8 pb-20 md:py-0"
    >
      <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-16 text-center">
        <p
          className={`font-heading font-bold text-dark leading-[1.25] tracking-tight transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ fontSize: 'clamp(26px, 4.1vw, 56px)' }}
        >
          &ldquo;<span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>The Backstage</span> is the{' '}
          <span className="bg-lime text-dark rounded-lg px-2 py-1 inline-block">all-in-one platform</span>
          {' '}that <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic' }}>replaces</span> your{' '}
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700 }}>event management team,</span>{' '}
          launching your{' '}
          <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic' }}>branded ticketing site</span>{' '}
          and <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400 }}>automating daily operations</span> with the{' '}
          <span className="bg-lime text-dark rounded-lg px-2 py-1 inline-block">AI Suite</span>
          &rdquo;
        </p>
      </div>
    </section>
  );
};

export default SocialProof;
