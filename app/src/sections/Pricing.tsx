import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
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

  const plans = [
    {
      name: 'Non-Ticketed Events',
      price: 'Free',
      period: 'forever',
      description: '100% free setup for university societies, free workshops, and community events.',
      features: [
        'Custom white-label subdomain',
        'Zero setup fees',
        'Basic attendee management',
        'Freemium AI support credits',
      ],
      cta: 'Start for free',
      detailsPath: '/docs/pricing-models#monthly-subscription',
      primary: false,
    },
    {
      name: 'Ticketed Events',
      price: '7%',
      period: 'per ticket sold',
      description: 'Flat Pay-As-You-Go commission. Includes our 4% platform fee and the 3% payment gateway cost.',
      features: [
        'Base revenue routed instantly to your bank',
        'Automated fee deduction via Pre-Paid Wallet',
        'Absorb the fee or pass it to buyers',
        'Pay-As-You-Go AI compute access',
      ],
      cta: 'Launch ticketed event',
      detailsPath: '/docs/pricing-models#pay-as-you-go',
      primary: true,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-offwhite py-24"
      id="pricing"
    >
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        {/* Heading */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2
            className="font-heading font-bold text-dark mb-4"
            style={{ fontSize: 'clamp(34px, 3.6vw, 52px)' }}
          >
            Simple Pricing
          </h2>
          <p className="text-dark/60 text-lg">
            Zero monthly lock-ins. Launch for free, or pay a flat commission only when you sell a ticket.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              } ${
                plan.primary
                  ? 'bg-lime/10 border-2 border-lime shadow-card'
                  : 'bg-white border border-dark/5'
              }`}
              style={{
                minHeight: '480px',
                transitionDelay: `${(i + 1) * 100}ms`,
              }}
            >
              {/* Popular Badge */}
              {plan.primary && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-1 py-1 bg-lime text-dark text-xs font-medium rounded-full">
                    <Sparkles size={12} />
                    Recommended for commercial events
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="font-heading font-semibold text-xl text-dark mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-heading font-bold text-4xl text-dark">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-dark/60">{plan.period}</span>
                  )}
                </div>
                <p className="text-dark/60 text-sm">{plan.description}</p>
                <button
                  onClick={() => {
                    window.open(plan.detailsPath, '_blank', 'noopener,noreferrer');
                  }}
                  className="mt-3 text-sm font-medium text-dark/70 hover:text-dark underline underline-offset-4"
                >
                  More details
                </button>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        plan.primary ? 'bg-lime' : 'bg-offwhite-dark'
                      }`}
                    >
                      <Check size={12} className="text-dark" />
                    </div>
                    <span className="text-dark/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => {
                  navigate('/auth');
                }}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                  plan.primary
                    ? 'bg-lime text-dark hover:bg-lime-dark hover:shadow-lg hover:shadow-lime/30'
                    : 'border border-dark/20 text-dark hover:bg-dark hover:text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div 
          className={`flex flex-wrap justify-center items-center gap-8 mt-12 text-dark/40 text-sm transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <span className="flex items-center gap-2">
            <Check size={16} />
            Zero monthly subscriptions or lock-ins
          </span>
          <span className="flex items-center gap-2">
            <Check size={16} />
            Instant payouts at point of sale
          </span>
          <span className="flex items-center gap-2">
            <Check size={16} />
            Pay-As-You-Go AI computing credits
          </span>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
