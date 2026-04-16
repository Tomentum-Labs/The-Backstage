import { useEffect, useState } from 'react';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import TextReveal from './sections/TextReveal';
import SocialProof from './sections/SocialProof';
import FeaturesOverview from './sections/FeaturesOverview';
import FeatureSell from './sections/FeatureSell';
import AIManagementSuite from './sections/AIManagementSuite';
import FeatureDashboard from './sections/FeatureDashboard';
import WhyChooseUs from './sections/WhyChooseUs';
import FAQ from './sections/FAQ';
import JoinWaitlist from './sections/JoinWaitlist';
import UseCases from './sections/UseCases';
import Footer from './sections/Footer';
import './App.css';

function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-offwhite">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation scrollY={scrollY} />
      
      {/* Main content */}
      <main className="relative">
        <Hero />
        <SocialProof />
        <TextReveal />
        <FeaturesOverview />
        <FeatureSell />
        <AIManagementSuite />
        <FeatureDashboard />
        <UseCases />
        <WhyChooseUs />
        <FAQ />
        <JoinWaitlist />
        <Footer />
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="relative bg-offwhite min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="grain-overlay" />
      <div className="relative z-10">
        <p
          className="text-[8rem] font-bold leading-none mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: 'hsl(78,100%,62%)',
            WebkitTextStroke: '2px hsl(78,60%,35%)',
          }}
        >404</p>
        <h1 className="text-2xl font-semibold text-[#121212] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Page not found</h1>
        <p className="text-[#707070] mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary inline-flex">
          Back to home
        </a>
      </div>
    </div>
  );
}

function App() {
  const path = window.location.pathname;
  if (path !== '/') return <NotFoundPage />;
  return <HomePage />;
}

export default App;
