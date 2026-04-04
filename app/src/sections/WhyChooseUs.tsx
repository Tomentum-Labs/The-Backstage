import { useEffect, useRef, useState } from 'react';
import { Percent, Wallet, Megaphone, Layers, Store, Ticket, BarChart3, ShieldCheck } from 'lucide-react';

const WhyChooseUs = () => {
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

  const reasons = [
    {
      icon: Percent,
      title: 'Lowest rates in the industry',
      description: 'Our transparent pricing ensures you keep more of your ticket revenue with no hidden fees.',
    },
    {
      icon: Wallet,
      title: 'All ticket revenue directly to you',
      description: 'Get paid instantly with direct payouts to your bank account after each ticket sale.',
    },
    {
      icon: Layers,
      title: 'Build, sell, and manage in one flow',
      description: 'Create events, sell tickets, and run operations without jumping tools.',
    },
    {
      icon: Store,
      title: 'Sell online and in person',
      description: 'Share direct checkout links online and sell physical tickets at the venue with your sales reps.',
    },
    {
      icon: Ticket,
      title: 'Ticketing built for real operations',
      description: 'Handle tiers, discounts, QR check-ins, and door sales from one system.',
    },
    {
      icon: Megaphone,
      title: 'Promote your own brand',
      description: 'Own your event experience with white-label pages and branded checkout.',
    },
    {
      icon: BarChart3,
      title: 'Manage and market from one dashboard',
      description: 'Run campaigns, track sales, and monitor performance without switching platforms.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliable tools for every event day',
      description: 'Keep operations smooth with real-time visibility for your team before and during the event.',
    },
  ];

  return (
    <section ref={sectionRef} className="w-full bg-offwhite py-24" id="why-choose-us">
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        <div className="text-center mb-14">
          <h2
            className={`font-heading font-bold text-dark mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(32px, 3vw, 48px)' }}
          >
            Why choose The Backstage?
          </h2>
          <p
            className={`text-dark/70 text-lg max-w-3xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            One platform to build, sell, manage, and market your events while keeping your brand front and center.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reasons.map((reason, i) => (
            <div
              key={reason.title}
              className={`rounded-2xl bg-white border border-dark/5 p-6 shadow-[0_8px_24px_rgb(0,0,0,0.06)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgb(0,0,0,0.08)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-lime flex items-center justify-center shrink-0">
                  <reason.icon size={20} className="text-dark" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-dark text-xl mb-2">{reason.title}</h3>
                  <p className="text-dark/70 leading-relaxed">{reason.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
