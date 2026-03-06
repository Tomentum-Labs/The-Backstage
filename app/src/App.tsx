import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import TextReveal from './sections/TextReveal';
import SocialProof from './sections/SocialProof';
import FeaturesOverview from './sections/FeaturesOverview';
import FeatureSell from './sections/FeatureSell';
import FeatureDashboard from './sections/FeatureDashboard';
import WhyChooseUs from './sections/WhyChooseUs';
import UseCases from './sections/UseCases';
import Pricing from './sections/Pricing';
import ClosingCTA from './sections/ClosingCTA';
import Footer from './sections/Footer';
import DocsPage from './pages/DocsPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import FullPageLoader from './components/FullPageLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
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
        <FeatureDashboard />
        <UseCases />
        <WhyChooseUs />
        <Pricing />
        <ClosingCTA />
        <Footer />
      </main>
    </div>
  );
}

// Blocks rendering of protected pages until the initial auth check finishes.
// This prevents the "flash of wrong page" and eliminates per-page session checks.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader label="Loading..." />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
        <Route path="/docs/:sectionId" element={<DocsPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
