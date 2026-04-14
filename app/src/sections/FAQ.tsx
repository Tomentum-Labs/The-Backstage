import { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'When will The Backstage launch?',
    answer: 'We are currently in closed development. Join the waitlist to get early access and be the first to know when we go live.',
  },
  {
    question: 'Is The Backstage only for Sri Lanka?',
    answer: 'We are built for Sri Lanka first, but the platform is designed to scale globally. Organizers anywhere in the world can use The Backstage to run their events.',
  },
  {
    question: 'How do payouts work?',
    answer: 'Ticket revenue routes directly to your bank account the moment a sale is made.',
  },
  {
    question: 'Can I sell tickets on my own website?',
    answer: 'Yes. The Backstage supports custom white-label domains, so your attendees buy tickets on your branded site, not ours. You keep 100% of your brand equity.',
  },
  {
    question: 'What types of events can I manage?',
    answer: 'Any type - concerts, conferences, sports events, workshops, club nights, festivals, and more. The Backstage is built to handle events of any size and format.',
  },
  {
    question: 'How does the AI Management Suite work?',
    answer: 'The AI Management Suite is a set of integrated tools that replace the heavy manual work of running an event — all automatically.',
  },
  {
    question: 'Can I sell tickets at the venue as well?',
    answer: 'Yes. Alongside online sales, you can sell physical tickets at the venue using our dedicated mobile staff app. Both channels sync in real time to a single dashboard.',
  },
  {
    question: 'Is there a fee per ticket sold?',
    answer: 'Pricing details will be announced at launch. Join the waitlist and you will be among the first to hear about our plans, including any early access benefits.',
  },
];

const FAQ = () => {
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-offwhite py-16 lg:py-24" id="faq">
      <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="text-center mb-14">
          <h2
            className={`font-heading font-bold text-dark mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(32px, 3vw, 48px)' }}
          >
            Frequently asked questions
          </h2>
          <p
            className={`text-dark/70 text-lg transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Everything you need to know before you get started.
          </p>
        </div>

        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-dark/10"
              >
                <AccordionTrigger className="font-heading font-semibold text-dark text-base py-5 hover:no-underline hover:text-dark transition-colors [&[data-state=open]]:text-dark">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-dark/70 text-sm leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
