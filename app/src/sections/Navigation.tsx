import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationProps {
  scrollY: number;
}

const Navigation = ({ scrollY }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = scrollY > 100;
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsMobileMenuOpen(false);
        }
      });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const goHome = () => {
    if (location.pathname !== '/') {
      navigate('/');
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${
          isScrolled
            ? 'bg-offwhite/90 backdrop-blur-md py-4 shadow-sm'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="font-heading font-bold text-xl text-dark tracking-tight"
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
          >
            The Backstage
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('usecases')}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => {
                window.open('/docs/getting-started', '_blank', 'noopener,noreferrer');
                setIsMobileMenuOpen(false);
              }}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors"
            >
              Docs
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary text-sm py-2.5"
            >
              Get started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-offwhite transition-transform duration-500 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-2xl font-heading font-bold text-dark"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-2xl font-heading font-bold text-dark"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('usecases')}
            className="text-2xl font-heading font-bold text-dark"
          >
            Use Cases
          </button>
          <button
            onClick={() => {
              window.open('/docs/getting-started', '_blank', 'noopener,noreferrer');
              setIsMobileMenuOpen(false);
            }}
            className="text-2xl font-heading font-bold text-dark"
          >
            Docs
          </button>
          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => {
                navigate('/auth');
                setIsMobileMenuOpen(false);
              }}
              className="text-lg font-medium text-dark/70"
            >
              Log in
            </button>
            <button
              onClick={() => {
                navigate('/auth');
                setIsMobileMenuOpen(false);
              }}
              className="btn-primary"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
