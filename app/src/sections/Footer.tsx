import { Mail, Twitter, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'AI Management Suite', href: '#ai-management-suite' },
      { label: 'Use Cases', href: '#usecases' },
      { label: 'Why Choose Us', href: '#why-choose-us' },
    ],
    Launch: [
      { label: 'Home', href: '#hero' },
      { label: 'Join Waitlist', href: '#waitlist' },
      { label: 'Contact', href: 'mailto:info@thebkstg.com' },
    ],
  };

  return (
    <footer className="bg-dark py-16">
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
          {/* Left Column - Brand */}
          <div className="lg:w-1/3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-lime rounded-xl flex items-center justify-center">
                <span className="font-heading font-bold text-dark text-lg">T</span>
              </div>
              <h3 className="font-bold text-2xl text-white" style={{ fontFamily: 'Pacifico, cursive', letterSpacing: '0.06em' }}>
                The Backstage
              </h3>
            </div>
            <p className="text-white/60 mb-6 max-w-xs">
              White label ticketing for modern teams. Create, sell, and manage events with ease.
            </p>
            <a
              href="mailto:hello@thebackstage.co"
              className="flex items-center gap-2 text-white/60 hover:text-lime transition-colors mb-6"
            >
              <Mail size={18} />
              hello@thebkstg.com
            </a>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-lime hover:text-dark transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-lime hover:text-dark transition-all"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-lime hover:text-dark transition-all"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Right Columns - Links */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-heading font-semibold text-white mb-4">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-white/60 hover:text-lime transition-colors text-sm flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} The Backstage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
