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
        <JoinWaitlist />
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return <HomePage />;
}

export default App;
