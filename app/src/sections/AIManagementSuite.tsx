import { useEffect, useRef, useState } from 'react';
import { Sparkles, MessageCircle, ShieldAlert, LineChart, Handshake, CalendarClock } from 'lucide-react';

const AIManagementSuite = () => {
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
      icon: Sparkles,
      title: 'AI Marketing Co-Pilot',
      description:
        'Automatically generate high-converting promotional copy and identify target audience clusters for your email and WhatsApp campaigns.',
    },
    {
      icon: MessageCircle,
      title: '24/7 WhatsApp Support Bot',
      description:
        'An intelligent assistant that instantly answers attendee questions about parking, schedules, and gate times, 24/7.',
    },
    {
      icon: ShieldAlert,
      title: 'Fraud & Scalper Detection',
      description:
        'Our anomaly detection algorithms silently monitor transactions in real-time to block bot networks and unauthorized resellers.',
    },
    {
      icon: LineChart,
      title: 'Post-Event AI Analyst',
      description:
        'Wake up the morning after your event to a fully drafted executive summary covering sales velocity, demographics, and actionable insights.',
    },
    {
      icon: Handshake,
      title: 'Sponsor Matchmaking',
      description:
        'Let AI generate custom pitch decks and recommend the perfect verified venues and sponsors based on your event demographic.',
    },
    {
      icon: CalendarClock,
      title: 'Smart Logistics Planner',
      description:
        'Input your event goals, and our AI will suggest optimal pricing tiers, venue capacities, and marketing timelines based on historical data.',
    },
  ];

  return (
    <section ref={sectionRef} className="relative w-full bg-offwhite py-24 overflow-hidden" id="ai-management-suite">
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        <div className="text-center mb-14">
          <h2
            className={`font-heading font-bold text-dark mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(32px, 3vw, 48px)' }}
          >
            Meet your new Virtual Team
          </h2>
          <p
            className={`text-dark/70 text-lg max-w-3xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Stop hiring massive teams for manual tasks. Our integrated AI Event Management Suite handles the heavy lifting so you can focus on the experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-lime/20 bg-white p-6 shadow-[0_8px_24px_rgb(0,0,0,0.05)] transition-all duration-500 hover:border-lime/50 hover:shadow-[0_24px_40px_-18px_rgba(163,230,53,0.45)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(i + 1) * 90}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime/15 via-lime/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-lime text-dark flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md">
                  <feature.icon size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-dark text-xl mb-2">{feature.title}</h3>
                  <p className="text-dark/80 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIManagementSuite;
