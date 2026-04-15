import { useEffect, useRef, useState } from 'react';
import { Globe, Zap, Bot, Sparkles, ShieldCheck, BarChart3, Smartphone, Users } from 'lucide-react';

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
      icon: Globe,
      title: 'Custom White-Label Domains',
      description: 'Sell tickets on your own custom website. Keep 100% of your brand equity and audience.',
    },
    {
      icon: Zap,
      title: 'Instant Direct Payouts',
      description: 'Get paid instantly. Ticket revenue routes directly to your bank account the second a sale is made.',
    },
    {
      icon: BarChart3,
      title: 'Manage all in one dashboard',
      description: 'Run campaigns, track sales, and monitor performance without switching platforms.',
    },
    {
      icon: Globe,
      title: 'Sell online and in person',
      description: 'Share direct checkout links online and sell physical tickets at the venue with your sales reps.',
    },
    {
      icon: Bot,
      title: '24/7 AI Support Bot',
      description: 'Automate customer service. Our AI bot answers attendee questions on WhatsApp 24/7 so you don\'t have to.',
    },
    {
      icon: Sparkles,
      title: 'AI Marketing Co-Pilot',
      description: 'Run effortless promotions. Let AI write your marketing copy and target the right audience for you.',
    },
    {
      icon: ShieldCheck,
      title: 'Real-Time Anti Scalping',
      description: 'Protect your fans. Stop bots and scalpers in real-time before they hijack your tickets.',
    },
    {
      icon: BarChart3,
      title: 'Automated Analytics',
      description: 'Skip the spreadsheets. Wake up to automated, ready to read executive summaries.',
    },
    {
      icon: Smartphone,
      title: 'Lightning Fast Gate Entry',
      description: 'Eliminate gate queues. Scan QR tickets in milliseconds using our dedicated mobile staff app.',
    },
    {
      icon: Users,
      title: 'B2B Supplier Matchmaking',
      description: 'Find trusted partners fast. Connect instantly with verified venues, A/V suppliers, and sponsors.',
    },
  ];

  return (
    <section ref={sectionRef} className="w-full bg-offwhite py-16 lg:py-24" id="why-choose-us">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
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
            Stop renting your audience. The Backstage gives you a white-label ticketing ecosystem powered by an AI management suite to scale your event, not your overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reasons.map((reason, i) => (
            <div
              key={reason.title}
              className={`group relative overflow-hidden rounded-2xl border border-lime/20 bg-white p-6 shadow-[0_8px_24px_rgb(0,0,0,0.05)] transition-all duration-500 hover:border-lime/50 hover:shadow-[0_24px_40px_-18px_rgba(163,230,53,0.45)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime/15 via-lime/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-lime text-dark flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md">
                  <reason.icon size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-dark text-xl mb-2">{reason.title}</h3>
                  <p className="text-dark/80 leading-relaxed text-sm">{reason.description}</p>
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
