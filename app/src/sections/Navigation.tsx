import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  scrollY: number;
}

const Navigation = ({ scrollY }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = scrollY > 100;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const goHome = () => {
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
              onClick={() => scrollToSection('why-choose-us')}
              className="text-sm font-medium text-dark/70 hover:text-dark transition-colors"
            >
              Why Choose Us
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scrollToSection('waitlist')}
              className="btn-primary text-sm py-2.5"
            >
              Join Waitlist
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
            onClick={() => scrollToSection('usecases')}
            className="text-2xl font-heading font-bold text-dark"
          >
            Use Cases
          </button>
          <button
            onClick={() => scrollToSection('why-choose-us')}
            className="text-2xl font-heading font-bold text-dark"
          >
            Why choose Us
          </button>
          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => {
                scrollToSection('waitlist');
                setIsMobileMenuOpen(false);
              }}
              className="btn-primary"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
