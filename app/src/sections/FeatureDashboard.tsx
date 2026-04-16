import { useEffect, useRef, useState } from 'react';
import { 
  Calendar, 
  Users, 
  Mail, 
  CreditCard, 
  BarChart3,
  DollarSign,
  CheckCircle,
  Ticket,
  MessageSquare,
  UploadCloud,
  Zap,
} from 'lucide-react';

const FeatureUnified = () => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // --- STYLE ENGINE ---
  // This class handles the "Pop-up" effect on hover.
  // When hovered: Z-Index becomes 100 (top), Scale becomes 1.1 (bigger), Shadow becomes huge.
  const cardClass = `
    absolute bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-dark/5 
    transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)
    hover:z-[100] hover:scale-110 hover:shadow-2xl cursor-default flex flex-col justify-between
  `;

  return (
    <section ref={sectionRef} className="w-full bg-offwhite py-16 lg:py-24 overflow-hidden min-h-0 lg:min-h-[120vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        
        {/* HEADING */}
        <div className="text-center mb-10 lg:mb-20 relative z-50">
          <h2
            className={`font-heading font-bold text-dark mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontSize: 'clamp(26px, 3vw, 48px)' }}
          >
            Handle everything from one place
          </h2>
               <p
                  className={`text-dark/70 text-base sm:text-lg max-w-2xl mx-auto transition-all duration-700 ${
                     isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
               >
            Your complete command center for events, sales, marketing, and guest management all in one unified platform.
          </p>
        </div>

            {/* Mobile: show only the main dashboard UI */}
            <div className="lg:hidden w-full max-w-[500px] mx-auto -mt-6">
               <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-dark/5 p-6 w-full h-[320px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lime rounded-xl flex items-center justify-center shadow-sm">
                           <BarChart3 size={20} className="text-dark" />
                        </div>
                        <div>
                           <div className="font-bold text-dark text-lg leading-tight">Analytics</div>
                           <div className="text-xs text-dark/60">Live Dashboard</div>
                        </div>
                     </div>
                     <span className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        LIVE
                     </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                     <div className="flex-1 bg-offwhite-dark rounded-xl p-2 text-center border border-dark/5">
                        <div className="text-lg font-heading font-bold text-dark">$48k</div>
                        <div className="text-[10px] text-dark/50 font-bold uppercase">Revenue</div>
                     </div>
                     <div className="flex-1 bg-offwhite-dark rounded-xl p-2 text-center border border-dark/5">
                        <div className="text-lg font-heading font-bold text-dark">3.2k</div>
                        <div className="text-[10px] text-dark/50 font-bold uppercase">Tickets</div>
                     </div>
                     <div className="flex-1 bg-offwhite-dark rounded-xl p-2 text-center border border-dark/5">
                        <div className="text-lg font-heading font-bold text-dark">4.8</div>
                        <div className="text-[10px] text-dark/50 font-bold uppercase">ROAS</div>
                     </div>
                  </div>

                  <div className="h-full flex items-end gap-1 px-1 mt-4 border-b border-dark/5 pb-1">
                     {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 85, 100, 70, 60].map((h, i) => (
                        <div key={i} className="flex-1 bg-lime/60 rounded-t-sm transition-colors duration-300" style={{ height: `${h}%` }} />
                     ))}
                  </div>
               </div>
            </div>

            {/* Desktop: full overlapping cluster */}
         <div className="hidden lg:block relative w-full max-w-[1000px] mx-auto h-[700px] -mt-28">

          {/* 1. CENTER: MAIN ANALYTICS (The Anchor) */}
          <div 
            className={`${cardClass} p-6 w-full lg:w-[500px] h-[320px] lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-30`}
            style={{
               opacity: isVisible ? 1 : 0,
               transform: isVisible ? 'translate(-50%, -50%)' : undefined
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 size={20} className="text-dark" />
                </div>
                <div>
                  <div className="font-bold text-dark text-lg leading-tight">Analytics</div>
                  <div className="text-xs text-dark/60">Live Dashboard</div>
                </div>
              </div>
              <span className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="flex gap-2 mt-4">
               <div className="flex-1 bg-offwhite-dark rounded-xl p-2 text-center border border-dark/5">
                 <div className="text-lg font-heading font-bold text-dark">$48k</div>
                 <div className="text-[10px] text-dark/50 font-bold uppercase">Revenue</div>
               </div>
               <div className="flex-1 bg-offwhite-dark rounded-xl p-2 text-center border border-dark/5">
                 <div className="text-lg font-heading font-bold text-dark">3.2k</div>
                 <div className="text-[10px] text-dark/50 font-bold uppercase">Tickets</div>
               </div>
               <div className="flex-1 bg-offwhite-dark rounded-xl p-2 text-center border border-dark/5">
                 <div className="text-lg font-heading font-bold text-dark">4.8</div>
                 <div className="text-[10px] text-dark/50 font-bold uppercase">ROAS</div>
               </div>
            </div>

            <div className="h-full flex items-end gap-1 px-1 mt-4 border-b border-dark/5 pb-1">
              {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 85, 100, 70, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-lime/60 rounded-t-sm hover:bg-lime transition-colors duration-300" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* 2. TOP LEFT: CALENDAR (Overlaps Center) */}
          <div 
             className={`${cardClass} p-4 w-full lg:w-[260px] lg:top-[15%] lg:left-[15%] z-20`}
             style={{ transitionDelay: '100ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-lime-600" />
                <span className="font-bold text-dark text-sm">Schedule</span>
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-3 bg-lime text-dark rounded-xl p-2">
                    <div className="w-8 h-8 rounded-lg bg-white/30 flex flex-col items-center justify-center text-[9px] font-bold leading-none">
                        <span>15</span><span>OCT</span>
                    </div>
                    <div className="text-xs font-bold">Product Launch</div>
                </div>
                <div className="flex items-center gap-3 bg-offwhite-dark rounded-xl p-2 opacity-60">
                    <div className="w-8 h-8 rounded-lg bg-white flex flex-col items-center justify-center text-[9px] font-bold leading-none">
                        <span>28</span><span>OCT</span>
                    </div>
                    <div className="text-xs font-bold">Team Retreat</div>
                </div>
             </div>
          </div>

          {/* 3. TOP RIGHT: REVENUE (Overlaps Center) */}
          <div 
            className={`${cardClass} p-5 w-full lg:w-[280px] lg:top-[12%] lg:right-[15%] z-20`}
            style={{ transitionDelay: '200ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
                      <DollarSign size={16} className="text-dark" />
                    </div>
                    <span className="font-bold text-sm text-dark">Revenue</span>
                </div>
                <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12%</div>
             </div>
             <div>
                <div className="text-3xl font-heading font-bold text-dark">$156k</div>
                <div className="text-[10px] text-dark/40 mb-2">Total Volume</div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-dark w-[75%]" />
                </div>
             </div>
          </div>

               {/* 4. BOTTOM LEFT: SEATING PLAN (Overlaps Center) */}
          <div 
             className={`${cardClass} p-5 w-full lg:w-[260px] lg:bottom-[8%] lg:left-[8%] z-20`}
             style={{ transitionDelay: '300ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-dark" />
                              <span className="font-bold text-sm text-dark">Seating Plan</span>
                </div>
                        <div className="text-[10px] bg-dark text-white px-1.5 py-0.5 rounded">A - Hall</div>
             </div>
                   <div className="bg-offwhite-dark rounded-xl p-2.5 border border-dark/5 mb-2">
                        <div className="grid grid-cols-8 gap-1">
                           {Array.from({ length: 32 }).map((_, i) => {
                              const isSelected = [2, 3, 10, 11, 18, 19, 26].includes(i);
                              const isReserved = [6, 7, 14, 15, 22, 23, 30].includes(i);

                              return (
                                 <div
                                    key={i}
                                    className={`h-2.5 rounded-sm ${
                                       isSelected
                                          ? 'bg-lime'
                                          : isReserved
                                             ? 'bg-amber-300'
                                             : 'bg-white border border-dark/10'
                                    }`}
                                 />
                              );
                           })}
                        </div>
                        <div className="text-[9px] text-dark/50 font-bold uppercase text-center mt-2">Stage</div>
                   </div>
                   <div className="flex items-center justify-between text-[9px] font-bold text-dark/60">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 rounded-[2px] bg-lime" />
                           <span>Selected</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 rounded-[2px] bg-amber-300" />
                           <span>Reserved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 rounded-[2px] bg-white border border-dark/10" />
                           <span>Free</span>
                        </div>
             </div>
          </div>

          

          {/* 5. BOTTOM RIGHT: TICKETS (Overlaps Center) */}
          <div 
             className={`${cardClass} p-5 w-full lg:w-[260px] lg:bottom-[12%] lg:right-[15%] z-20`}
             style={{ transitionDelay: '400ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex items-center gap-2 mb-3">
                <Ticket size={16} className="text-dark" />
                <span className="font-bold text-sm text-dark">Tickets</span>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>VIP</span><span>90%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-lime w-[90%]" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold pt-1">
                    <span>Normal</span><span>65%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-lime w-[20%]" />
                </div>
             </div>
          </div>

          {/* 6. FAR LEFT: MARKETING (Floating) */}
          <div 
             className={`${cardClass} p-4 w-full lg:w-[220px] lg:top-1/2 lg:-translate-y-1/2 lg:left-[5%] z-40`}
             style={{ transitionDelay: '500ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex items-center gap-2 mb-3">
                <Mail size={16} className="text-lime-600" />
                <div className="font-bold text-dark text-sm">Campaigns</div>
             </div>
             <div className="space-y-2">
                <div className="bg-offwhite-dark p-2 rounded-lg border border-dark/5">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold">Newsletter</span>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    </div>
                    <div className="text-[10px] text-dark/60">Open Rate: 48%</div>
                </div>
             </div>
          </div>

          {/* 7. FAR RIGHT: PAYMENTS (Floating) */}
          <div 
             className={`${cardClass} p-4 w-full lg:w-[220px] lg:top-1/2 lg:-translate-y-1/2 lg:right-[5%] z-40`}
             style={{ transitionDelay: '600ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-lime-600" />
                <div className="font-bold text-dark text-sm">Payments</div>
             </div>
             <div className="text-xl font-heading font-bold text-dark mb-2">$48,290</div>
             <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 p-1 rounded justify-center">
                 <CheckCircle size={10} />
                 <span>Operational</span>
             </div>
          </div>

          {/* --- THE MICRO WIDGETS (Small components filling gaps) --- */}

          {/* 9. Team Chat (Small, Top Right) */}
          <div 
             className={`${cardClass} p-3 w-[160px] lg:top-[25%] lg:right-[8%] z-30`}
             style={{ transitionDelay: '250ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex items-center gap-2 mb-2">
                 <MessageSquare size={12} className="text-lime-600"/>
                 <span className="text-[10px] font-bold">Team Chat</span>
             </div>
             <div className="text-[9px] text-dark/50 italic">Sarah is typing...</div>
          </div>

          {/* 10. Upload Progress (Small, Bottom Right) */}
          <div 
             className={`${cardClass} p-3 w-[160px] lg:bottom-[10%] lg:right-[10%] z-50`}
             style={{ transitionDelay: '550ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="flex justify-between items-center mb-1">
                 <UploadCloud size={12} className="text-dark"/>
                 <span className="text-[9px] font-bold">Uploading...</span>
             </div>
             <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-lime w-[60%] animate-pulse" />
             </div>
          </div>

          {/* 11. Live Users (Small, Bottom Left) */}
          <div 
             className={`${cardClass} p-2 flex-row gap-3 items-center w-[140px] lg:bottom-[10%] lg:left-[33%] z-50`}
             style={{ transitionDelay: '400ms', opacity: isVisible ? 1 : 0 }}
          >
             <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center text-dark">
                <Zap size={14} />
             </div>
             <div>
                <div className="text-[9px] text-dark/50 font-bold uppercase">Active</div>
                <div className="font-bold text-sm">428</div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeatureUnified;