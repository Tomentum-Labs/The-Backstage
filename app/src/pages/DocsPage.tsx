import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Cookie,
  FileText,
  Layers,
  Menu,
  Megaphone,
  Moon,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Sun,
  Ticket,
} from 'lucide-react';
import { Link, NavLink, useLocation, useParams } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type DocsSection = {
  id: string;
  title: string;
  category: 'Manual' | 'Legal';
  summary: string;
  description: string;
  heroImage: string;
  highlights: string[];
  steps: string[];
  components: Array<{ name: string; description: string }>;
  note: string;
};

const sections: DocsSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Manual',
    summary: 'Set up account, team permissions, branding, and payout defaults before launch.',
    description:
      'This section walks through initial onboarding and setup. Complete these steps first to ensure every event page, checkout experience, and report reflects your brand and operations rules from day one.',
    heroImage: '/hero_1.jpg',
    highlights: [
      'Organization setup with role-based invitations and access scopes.',
      'White-label branding for logo, colors, and customer-facing communication.',
      'Global defaults for currency, timezone, taxes, and order behavior.',
      'Payout profile setup and settlement preferences.',
    ],
    steps: [
      'Create your workspace and invite operations, marketing, and finance users.',
      'Apply brand kit and preview buyer-facing pages and checkout.',
      'Configure global settings including currency, taxes, and policy defaults.',
      'Run a test order to confirm email, QR generation, and event assignment.',
    ],
    components: [
      {
        name: 'Workspace Settings',
        description: 'Controls organization identity, business details, and default platform behavior.',
      },
      {
        name: 'Brand Kit',
        description: 'Logo, color system, and visual tokens used across all ticketing touchpoints.',
      },
      {
        name: 'Team Access',
        description: 'Permission matrix for admins, operators, sales reps, and support agents.',
      },
    ],
    note: 'Tip: finalize branding before publishing events to keep buyer trust consistent across channels.',
  },
  {
    id: 'event-builder',
    title: 'Event Builder',
    category: 'Manual',
    summary: 'Build event structures with ticket tiers, seat plans, and launch timing controls.',
    description:
      'Event Builder is your operational foundation for publishing sellable inventory. It supports tiered pricing, seat layouts, and release controls so teams can launch with precision and avoid inventory conflicts.',
    heroImage: '/hero_2.jpg',
    highlights: [
      'Single and multi-session event support with schedule blocks.',
      'Tiered ticket products such as VIP, Early Bird, Standard, and invite-only tiers.',
      'Seat map and box-plan allocation with zone-level inventory controls.',
      'Draft, scheduled, and instant publishing workflows.',
    ],
    steps: [
      'Create event metadata and configure date, venue, and schedule.',
      'Define ticket types, limits, and pricing logic for each tier.',
      'Attach seat map or standing capacity and set allocation strategy.',
      'Preview customer flow and publish according to launch plan.',
    ],
    components: [
      {
        name: 'Event Editor',
        description: 'Main canvas for event details, schedule, and publication settings.',
      },
      {
        name: 'Ticket Designer',
        description: 'Defines ticket variants, pricing rules, and purchase constraints.',
      },
      {
        name: 'Seating Planner',
        description: 'Visual seat and box management with grouped zone allocations.',
      },
    ],
    note: 'Best practice: lock inventory rules before launching campaigns to prevent oversubscription.',
  },
  {
    id: 'selling-channels',
    title: 'Selling Channels',
    category: 'Manual',
    summary: 'Sell online and physically (sales reps/box office) with unified stock and reporting.',
    description:
      'Selling Channels unifies online checkout, direct links, and in-person sales operations. Every order updates inventory in real time, so your digital campaigns and venue counters always stay synchronized.',
    heroImage: '/hero_3.jpg',
    highlights: [
      'Direct checkout links for websites, social media, and partner campaigns.',
      'Box office mode for walk-up sales and last-minute demand.',
      'Rep-driven sales attribution for distributed teams.',
      'Instant ticket fulfillment with QR codes and buyer confirmation flows.',
    ],
    steps: [
      'Enable required channels and assign channel-specific inventory buckets.',
      'Set rep permissions and sales attribution rules.',
      'Publish trackable links for digital campaigns and partner promotions.',
      'Monitor live channel performance and rebalance allocations if needed.',
    ],
    components: [
      {
        name: 'Checkout Links',
        description: 'Branded purchase links with analytics-ready attribution parameters.',
      },
      {
        name: 'Box Office Console',
        description: 'Fast in-person ticketing interface for front-desk and event-gate teams.',
      },
      {
        name: 'Rep Dashboard',
        description: 'Tracks rep-level performance and conversion outcomes.',
      },
    ],
    note: 'Operational note: keep a reserved door inventory slice for event-day flexibility.',
  },
  {
    id: 'marketing',
    title: 'Marketing Tools',
    category: 'Manual',
    summary: 'Plan and optimize campaigns with clear attribution from click to ticket sale.',
    description:
      'Marketing Tools help your team launch segmented campaigns and evaluate performance without external dashboards. Promotion decisions become revenue-driven with direct conversion and order visibility.',
    heroImage: '/hero_4.jpg',
    highlights: [
      'Audience targeting by purchase behavior and engagement profile.',
      'Promo code engine with limits, expiry, and audience conditions.',
      'Campaign-level conversion and revenue attribution.',
      'Reusable templates for recurring launches.',
    ],
    steps: [
      'Define campaign objective and target segment.',
      'Configure offer or incentive and attach conversion links.',
      'Launch through preferred channels and monitor engagement.',
      'Iterate messaging/offers based on revenue outcome.',
    ],
    components: [
      {
        name: 'Audience Manager',
        description: 'Segment builder for high-precision campaign targeting.',
      },
      {
        name: 'Promotion Rules',
        description: 'Centralized controls for coupon and incentive behaviors.',
      },
      {
        name: 'Campaign Analytics',
        description: 'Live funnel and revenue insights by campaign source.',
      },
    ],
    note: 'Tip: keep consistent naming conventions for campaigns to simplify quarterly reporting.',
  },
  {
    id: 'operations',
    title: 'Operations & Analytics',
    category: 'Manual',
    summary: 'Run event-day decisions from live performance signals and operational telemetry.',
    description:
      'Operations & Analytics acts as your command center. Teams can monitor attendance velocity, payment health, and inventory status in real time and coordinate responses quickly.',
    heroImage: '/venue_theater.jpg',
    highlights: [
      'Live sales/attendance dashboard with channel split and pacing indicators.',
      'Role-based audit trail for key operational actions.',
      'Settlement visibility where your ticket revenue remains yours (no percentage take).',
      'Post-event exports for finance and performance reviews.',
    ],
    steps: [
      'Open command center before doors and verify readiness indicators.',
      'Track scans, queue patterns, and seat utilization by zone.',
      'Respond to spikes by shifting allocations or staffing.',
      'Export event summary and reconcile outcomes after close.',
    ],
    components: [
      {
        name: 'Live Command Center',
        description: 'Real-time KPI board for sales, attendance, and channel health.',
      },
      {
        name: 'Attendance Monitor',
        description: 'Gate-level entry tracking and scan integrity monitoring.',
      },
      {
        name: 'Settlement Reports',
        description: 'Finance-ready payout and reconciliation details.',
      },
    ],
    note: 'Recommendation: define threshold alerts to trigger proactive operations decisions.',
  },
  {
    id: 'support',
    title: 'Support & Security',
    category: 'Manual',
    summary: 'Harden access and response workflows to keep service and event integrity intact.',
    description:
      'Support & Security describes how to protect operational access while giving teams fast support paths. It is designed for high-confidence launches and incident response readiness.',
    heroImage: '/festival_outdoor.jpg',
    highlights: [
      'Permission boundaries by role and environment access level.',
      'Security controls for sensitive actions and session handling.',
      'Escalation procedures for payment and event-day incidents.',
      'Audit coverage for accountability and compliance needs.',
    ],
    steps: [
      'Assign least-privilege access roles by team function.',
      'Configure security policies for privileged operations.',
      'Set an escalation matrix and support ownership model.',
      'Review logs and enforce corrective actions after each event.',
    ],
    components: [
      {
        name: 'Permission Matrix',
        description: 'Controls who can perform sensitive operations.',
      },
      {
        name: 'Security Policies',
        description: 'Session and action-level protections for critical workflows.',
      },
      {
        name: 'Support Queue',
        description: 'Structured incident tracking and response visibility.',
      },
    ],
    note: 'Security note: review access rights monthly and before large event launches.',
  },
  {
    id: 'pricing-models',
    title: 'Pricing Models',
    category: 'Manual',
    summary: 'Compare monthly subscription and pay-as-you-go plans, with recommended wallet operations.',
    description:
      'Ticket Labs uses a hybrid pricing model with two plan options. Recurring organizers can choose a monthly subscription, while one-off organizers can choose pay-as-you-go commission pricing.',
    heroImage: '/hero_4.jpg',
    highlights: [
      'Monthly Subscription: fixed fee and predictable monthly recurring costs for frequent events.',
      'Pay As You Go: 4% commission per sale with no recurring subscription commitment.',
      'Plan fit guidance for recurring versus one-off event patterns.',
      'Pre Paid Wallet operations recommended for safer and compliant settlements in Sri Lanka.',
    ],
    steps: [
      'Assess event frequency to decide between recurring monthly cost and per-sale pricing.',
      'Choose the pricing plan that matches organizer risk tolerance and event cadence.',
      'For pay-as-you-go, pre-load wallet balance before tickets go live.',
      'Track deductions per sale and top up wallet balance before high-demand windows.',
    ],
    components: [
      {
        name: 'Plan Selector',
        description: 'Lets organizers choose Monthly Subscription or Pay As You Go pricing.',
      },
      {
        name: 'Commission Engine',
        description: 'Automatically applies the 4% commission deduction per sale.',
      },
      {
        name: 'Ticket Labs Wallet',
        description: 'Prepaid balance used to settle commission deductions in real time.',
      },
    ],
    note: 'Recommendation: use Monthly for recurring events and Pay As You Go for annual or one-off events.',
  },
  {
    id: 'terms-and-conditions',
    title: 'Terms and Conditions',
    category: 'Legal',
    summary: 'Defines legal usage boundaries, responsibilities, and service terms.',
    description:
      'This legal page provides an operational interpretation of account responsibilities, usage conditions, and dispute boundaries relevant to platform usage.',
    heroImage: '/creator_workshop.jpg',
    highlights: [
      'Usage rights and obligations for account holders.',
      'Organizer responsibility for event content and compliance.',
      'Service limitation and liability boundaries.',
      'Termination/suspension and dispute resolution structure.',
    ],
    steps: [
      'Review terms with legal and operations owners.',
      'Align internal SOPs with account responsibilities.',
      'Communicate obligations to admins and staff users.',
      'Re-check terms on major policy updates.',
    ],
    components: [
      { name: 'Usage Scope', description: 'Defines permitted and restricted usage patterns.' },
      { name: 'Liability Boundaries', description: 'Clarifies organizer vs platform responsibilities.' },
      { name: 'Dispute Process', description: 'Outlines formal notice and resolution pathway.' },
    ],
    note: 'Legal note: this documentation is informational and not legal advice.',
  },
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    category: 'Legal',
    summary: 'Explains data collection, processing purpose, retention, and privacy rights handling.',
    description:
      'This section documents how attendee and organizer data is handled across ticketing operations, analytics, and support workflows, with policy-oriented controls for privacy management.',
    heroImage: '/hero_1.jpg',
    highlights: [
      'Data categories and operational purposes.',
      'Retention and access control posture.',
      'Data rights workflows for access/correction/deletion.',
      'Transparency requirements for user notices.',
    ],
    steps: [
      'Catalog data entities by operational need.',
      'Restrict access to sensitive attributes by role.',
      'Define retention and deletion schedules.',
      'Establish documented handling for data rights requests.',
    ],
    components: [
      { name: 'Data Inventory', description: 'Maps system data to business purpose and owner.' },
      { name: 'Retention Controls', description: 'Policy-driven lifecycle settings for data classes.' },
      { name: 'Privacy Requests', description: 'Workflow for user privacy rights operations.' },
    ],
    note: 'Privacy note: keep your external policy wording synchronized with actual product behavior.',
  },
  {
    id: 'refund-policy',
    title: 'Refund Policy',
    category: 'Legal',
    summary: 'Defines refund eligibility, processing rules, and operational communication standards.',
    description:
      'Refund policy guidance ensures customers, support teams, and finance stakeholders follow consistent decision logic across events and ticket types.',
    heroImage: '/hero_2.jpg',
    highlights: [
      'Eligibility logic by tier, event state, and policy windows.',
      'Manual approval and automated processing paths.',
      'Partial/full refund handling with clear audit trail.',
      'Finance impact visibility for reconciliation.',
    ],
    steps: [
      'Define event-level eligibility terms before launch.',
      'Publish customer-facing refund terms at checkout.',
      'Process requests with standardized approval workflow.',
      'Review refund trends to improve future policy settings.',
    ],
    components: [
      { name: 'Refund Rules', description: 'Configurable criteria for automatic eligibility checks.' },
      { name: 'Approval Queue', description: 'Review and action center for refund requests.' },
      { name: 'Refund Ledger', description: 'Historical record for finance and support teams.' },
    ],
    note: 'Policy note: align campaign copy and checkout copy with the same refund rules.',
  },
  {
    id: 'cookie-policy',
    title: 'Cookie Policy',
    category: 'Legal',
    summary: 'Documents cookie categories, consent behavior, and analytics usage boundaries.',
    description:
      'Cookie policy guidance describes how session, preference, and analytics cookies are used in ticketing flows and how user consent should be captured and respected.',
    heroImage: '/hero_3.jpg',
    highlights: [
      'Essential, preference, and analytics cookie categories.',
      'Consent capture and preference persistence behavior.',
      'Attribution usage for campaign performance insights.',
      'Regional compliance sensitivity and policy maintenance.',
    ],
    steps: [
      'Map each cookie to category and purpose.',
      'Implement consent UX for configurable categories.',
      'Respect stored preferences across sessions.',
      'Review policy coverage after integrations and feature updates.',
    ],
    components: [
      { name: 'Cookie Categories', description: 'Classification model for storage behavior and purpose.' },
      { name: 'Consent Banner', description: 'User control surface for acceptance and preferences.' },
      { name: 'Consent Logs', description: 'Audit records of cookie preference actions.' },
    ],
    note: 'Compliance note: adapt consent requirements by deployment region and legal framework.',
  },
];

const DocsPage = () => {
  const { sectionId } = useParams();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeContentSection, setActiveContentSection] = useState('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const storedTheme = window.localStorage.getItem('docs-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const isDark = theme === 'dark';
  const accentTextClass = isDark ? 'text-lime' : 'text-lime-700';
  const accentIconClass = isDark ? 'text-lime/90' : 'text-lime-700';
  const accentBorderClass = isDark ? 'border-lime' : 'border-lime-700';
  const accentInlineButtonClass = isDark
    ? 'border-lime/40 bg-lime/10 text-lime hover:bg-lime/20'
    : 'border-lime-300 bg-lime-100 text-lime-700 hover:bg-lime-200';
  const activeSection = sections.find((section) => section.id === sectionId) ?? sections[0];
  const activeIndex = sections.findIndex((section) => section.id === activeSection.id);
  const nextSection = activeIndex >= 0 && activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null;
  const manualSections = sections.filter((section) => section.category === 'Manual');
  const legalSections = sections.filter((section) => section.category === 'Legal');
  const contentSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'covers', label: 'What this section covers' },
    { id: 'how-to-use', label: 'How to use it' },
    { id: 'components', label: 'UI elements and components' },
    { id: 'note', label: 'Note' },
    ...(activeSection.id === 'pricing-models'
      ? [
          { id: 'monthly-subscription', label: 'Monthly Subscription' },
          { id: 'pay-as-you-go', label: 'Pay As You Go' },
          { id: 'prepaid-wallet', label: 'Pre Paid Wallet' },
        ]
      : []),
    { id: 'next', label: 'Next section' },
  ];

  const getSectionIcon = (id: string) => {
    if (id === 'getting-started') return <Settings size={14} />;
    if (id === 'event-builder') return <Layers size={14} />;
    if (id === 'selling-channels') return <Ticket size={14} />;
    if (id === 'marketing') return <Megaphone size={14} />;
    if (id === 'operations') return <BarChart3 size={14} />;
    if (id === 'support') return <ShieldCheck size={14} />;
    if (id === 'pricing-models') return <ReceiptText size={14} />;
    if (id === 'terms-and-conditions') return <Scale size={14} />;
    if (id === 'privacy-policy') return <FileText size={14} />;
    if (id === 'refund-policy') return <ReceiptText size={14} />;
    if (id === 'cookie-policy') return <Cookie size={14} />;
    return <CalendarCheck size={14} />;
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeSection.id]);

  useEffect(() => {
    window.localStorage.setItem('docs-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    setActiveContentSection('overview');

    const elements = contentSections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveContentSection(visible[0].target.id);
        }
      },
      {
        root,
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: '0px 0px -45% 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [activeSection.id]);

  useEffect(() => {
    const hashId = location.hash.replace('#', '');
    if (!hashId) return;

    const rafId = requestAnimationFrame(() => {
      const sectionEl = document.getElementById(hashId);
      if (!sectionEl) return;
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveContentSection(hashId);
    });

    return () => cancelAnimationFrame(rafId);
  }, [activeSection.id, location.hash]);

  const scrollToContentSection = (id: string) => {
    const sectionEl = document.getElementById(id);
    if (!sectionEl) return;
    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderDocsNavigation = (onItemClick?: () => void) => (
    <>
      <h2 className={`font-heading text-xs uppercase tracking-[0.12em] mb-4 ${accentTextClass}`}>Manual</h2>
      <nav className="space-y-2 mb-8">
        {manualSections.map((section) => (
          <NavLink
            key={section.id}
            to={`/docs/${section.id}`}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? isDark
                    ? 'border-lime text-white font-semibold bg-white/5'
                    : 'border-lime text-dark font-semibold bg-dark/[0.06]'
                  : isDark
                    ? 'border-transparent text-white/65 hover:text-white hover:bg-white/[0.03]'
                    : 'border-transparent text-dark/65 hover:text-dark hover:bg-dark/[0.03]'
              }`
            }
          >
            <span className={accentIconClass}>{getSectionIcon(section.id)}</span>
            <span>{section.title}</span>
          </NavLink>
        ))}
      </nav>

      <h2 className={`font-heading text-xs uppercase tracking-[0.12em] mb-4 ${accentTextClass}`}>Legal</h2>
      <nav className="space-y-2">
        {legalSections.map((section) => (
          <NavLink
            key={section.id}
            to={`/docs/${section.id}`}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? isDark
                    ? 'border-lime text-white font-semibold bg-white/5'
                    : 'border-lime text-dark font-semibold bg-dark/[0.06]'
                  : isDark
                    ? 'border-transparent text-white/65 hover:text-white hover:bg-white/[0.03]'
                    : 'border-transparent text-dark/65 hover:text-dark hover:bg-dark/[0.03]'
              }`
            }
          >
            <span className={accentIconClass}>{getSectionIcon(section.id)}</span>
            <span>{section.title}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <div
      className={`docs-theme ${isDark ? 'docs-theme-dark bg-dark text-white' : 'docs-theme-light bg-offwhite text-dark'} h-screen overflow-hidden`}
    >
      <header
        className={`h-16 border-b backdrop-blur ${
          isDark ? 'border-white/10 bg-dark/95' : 'border-dark/10 bg-offwhite/95'
        }`}
      >
        <div className="h-full w-full px-4 sm:px-5 lg:px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border transition-colors ${
                isDark
                  ? 'border-white/15 text-white/85 hover:bg-white/10'
                  : 'border-dark/15 text-dark/85 hover:bg-dark/10'
              }`}
              aria-label="Open docs navigation"
            >
              <Menu size={18} />
            </button>
            <span className={`font-heading font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-dark'}`}>
              Ticket Labs Docs
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-flex items-center gap-2 text-sm ${isDark ? 'text-white/70' : 'text-dark/70'}`}>
              <BookOpen size={14} className={accentTextClass} />
              Documentation
            </span>
            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                isDark
                  ? 'border-white/15 text-white hover:bg-white/10'
                  : 'border-dark/15 text-dark hover:bg-dark/10'
              }`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                isDark ? 'text-lime hover:bg-lime/10' : 'text-lime-700 hover:bg-lime-100'
              }`}
            >
              Back to site
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent
          side="left"
          className={`p-0 w-[85vw] max-w-[320px] sm:max-w-[360px] ${
            isDark ? 'bg-dark border-white/10 text-white' : 'bg-offwhite border-dark/10 text-dark'
          }`}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Docs navigation</SheetTitle>
            <SheetDescription>Navigate between documentation sections.</SheetDescription>
          </SheetHeader>
          <div
            className={`h-full overflow-y-auto px-4 sm:px-5 py-8 ${
              isDark ? 'bg-dark/90' : 'bg-offwhite-dark/70'
            }`}
          >
            {renderDocsNavigation(() => setIsMobileSidebarOpen(false))}
          </div>
        </SheetContent>
      </Sheet>

      <main className="h-[calc(100vh-4rem)] w-full">
        <div className="h-full overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
          <aside
            className={`hidden lg:block h-full overflow-y-auto border-r px-4 sm:px-5 py-8 ${
              isDark ? 'border-white/10 bg-dark/80' : 'border-dark/10 bg-offwhite-dark/70'
            }`}
          >
            {renderDocsNavigation()}
          </aside>

          <div ref={contentRef} className="h-full overflow-y-auto px-5 sm:px-8 lg:px-12 py-8">
            <section className="max-w-4xl">
              <div id="overview" className="scroll-mt-6">
                <p className={`text-xs uppercase tracking-[0.12em] mb-3 ${accentTextClass}`}>{activeSection.category}</p>
                <h2 className={`font-heading font-bold text-3xl sm:text-4xl mb-4 ${isDark ? 'text-white' : 'text-dark'}`}>
                  {activeSection.title}
                </h2>
                <p className={`mb-8 text-base sm:text-lg leading-relaxed ${isDark ? 'text-white/75' : 'text-dark/75'}`}>
                  {activeSection.description}
                </p>
              </div>

              <div className={`relative rounded-xl overflow-hidden border mb-8 ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                <img
                  src={activeSection.heroImage}
                  alt={activeSection.title}
                  className="w-full h-[220px] sm:h-[280px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">{activeSection.summary}</p>
                </div>
              </div>

              <h3
                id="covers"
                className={`font-heading font-semibold text-xl mb-4 scroll-mt-6 ${isDark ? 'text-white' : 'text-dark'}`}
              >
                What this section covers
              </h3>

              <div className="space-y-4">
                {activeSection.highlights.map((point) => (
                  <div
                    key={point}
                    className={`flex items-start gap-3 pb-4 border-b ${
                      isDark ? 'text-white/90 border-white/10' : 'text-dark/85 border-dark/10'
                    }`}
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-lime shrink-0" />
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>

              <h3
                id="how-to-use"
                className={`font-heading font-semibold text-xl mt-10 mb-4 scroll-mt-6 ${isDark ? 'text-white' : 'text-dark'}`}
              >
                How to use it
              </h3>
              <div className="space-y-3">
                {activeSection.steps.map((step, index) => (
                  <div
                    key={step}
                    className={`flex items-start gap-3 pb-3 border-b ${isDark ? 'border-white/10' : 'border-dark/10'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-lime text-dark text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className={`${isDark ? 'text-white/85' : 'text-dark/85'} leading-relaxed`}>{step}</p>
                  </div>
                ))}
              </div>

              <h3
                id="components"
                className={`font-heading font-semibold text-xl mt-10 mb-4 scroll-mt-6 ${isDark ? 'text-white' : 'text-dark'}`}
              >
                UI elements and components
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSection.components.map((component) => (
                  <div
                    key={component.name}
                    className={`border rounded-lg p-4 ${
                      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-dark/10 bg-dark/[0.02]'
                    }`}
                  >
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>{component.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-white/70' : 'text-dark/70'}`}>{component.description}</p>
                  </div>
                ))}
              </div>

              <div
                id="note"
                className={`mt-8 border-l-2 ${accentBorderClass} px-4 py-3 rounded-r-md scroll-mt-6 ${
                  isDark ? 'bg-white/[0.02]' : 'bg-dark/[0.02]'
                }`}
              >
                <p className={`text-sm ${isDark ? 'text-white/75' : 'text-dark/75'}`}>{activeSection.note}</p>
              </div>

              {activeSection.id === 'pricing-models' && (
                <div className="mt-10 space-y-8">
                  <div
                    id="monthly-subscription"
                    className={`border rounded-xl p-5 scroll-mt-6 ${
                      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-dark/10 bg-dark/[0.02]'
                    }`}
                  >
                    <h3 className={`font-heading font-semibold text-xl mb-2 ${isDark ? 'text-white' : 'text-dark'}`}>
                      A. Monthly Subscription (Flat Fee)
                    </h3>
                    <p className={`${isDark ? 'text-white/80' : 'text-dark/80'} text-sm leading-relaxed mb-3`}>
                      Organizers pay a fixed monthly rate for access to the platform, regardless of ticket volume.
                    </p>
                    <ul className={`space-y-2 text-sm ${isDark ? 'text-white/75' : 'text-dark/75'}`}>
                      <li>Pros: predictable MRR, simpler accounting, ideal for frequent monthly organizers.</li>
                      <li>Cons: one-off organizers may subscribe briefly, run one event, and cancel.</li>
                      <li>Feasibility: low as a standalone model for the local event market.</li>
                    </ul>
                  </div>

                  <div
                    id="pay-as-you-go"
                    className={`border rounded-xl p-5 scroll-mt-6 ${
                      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-dark/10 bg-dark/[0.02]'
                    }`}
                  >
                    <h3 className={`font-heading font-semibold text-xl mb-2 ${isDark ? 'text-white' : 'text-dark'}`}>
                      B. Commission / Pay As You Go
                    </h3>
                    <p className={`${isDark ? 'text-white/80' : 'text-dark/80'} text-sm leading-relaxed mb-3`}>
                      Platform usage is free upfront, and a 4% commission is deducted from each ticket sale.
                    </p>
                    <ul className={`space-y-2 text-sm ${isDark ? 'text-white/75' : 'text-dark/75'}`}>
                      <li>Pros: zero upfront risk, easier client acquisition, scales with organizer success.</li>
                      <li>Pros: fee can be passed to ticket buyers at checkout in many event flows.</li>
                      <li>Cons: platform revenue can fluctuate with seasonal event demand.</li>
                      <li>Feasibility: highly feasible and aligned with ticketing industry norms.</li>
                    </ul>
                  </div>

                  <div
                    id="prepaid-wallet"
                    className={`border rounded-xl p-5 scroll-mt-6 ${
                      isDark ? 'border-white/10 bg-white/[0.02]' : 'border-dark/10 bg-dark/[0.02]'
                    }`}
                  >
                    <h3 className={`font-heading font-semibold text-xl mb-2 ${isDark ? 'text-white' : 'text-dark'}`}>
                      Pre Paid Wallet (Recommended)
                    </h3>
                    <p className={`${isDark ? 'text-white/80' : 'text-dark/80'} text-sm leading-relaxed mb-3`}>
                      Organizers pre-load a Ticket Labs Wallet using a bank card. The 4% commission is deducted automatically per sale.
                    </p>
                    <ul className={`space-y-2 text-sm ${isDark ? 'text-white/75' : 'text-dark/75'}`}>
                      <li>Helps avoid post-event settlement cash flow issues.</li>
                      <li>Supports a safer and more compliant multi-vendor SaaS setup in Sri Lanka.</li>
                    </ul>
                  </div>
                </div>
              )}

              {nextSection ? (
                <div id="next" className={`mt-10 pt-6 border-t scroll-mt-6 ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                  <p className={`text-sm mb-3 ${isDark ? 'text-white/50' : 'text-dark/50'}`}>Next section</p>
                  <Link
                    to={`/docs/${nextSection.id}`}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${accentInlineButtonClass}`}
                  >
                    {nextSection.title}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div id="next" className={`mt-10 pt-6 border-t scroll-mt-6 ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                  <p className={`text-sm mb-3 ${isDark ? 'text-white/50' : 'text-dark/50'}`}>You’ve reached the last section.</p>
                  <Link
                    to="/docs/getting-started"
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${accentInlineButtonClass}`}
                  >
                    Back to Getting Started
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>
          </div>

          <aside
            className={`hidden lg:block h-full overflow-y-auto border-l px-4 py-8 ${
              isDark ? 'border-white/10 bg-dark/70' : 'border-dark/10 bg-offwhite-dark/70'
            }`}
          >
            <div className="sticky top-0">
              <h2 className={`font-heading text-xs uppercase tracking-[0.12em] mb-4 ${accentTextClass}`}>On this page</h2>
              <nav className="space-y-1.5">
                {contentSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToContentSection(section.id)}
                    className={`w-full text-left px-3 py-2 text-sm border-l-2 transition-colors ${
                      activeContentSection === section.id
                        ? isDark
                          ? 'border-lime text-white bg-white/5 font-semibold'
                          : 'border-lime text-dark bg-dark/[0.06] font-semibold'
                        : isDark
                          ? 'border-transparent text-white/60 hover:text-white hover:bg-white/[0.03]'
                          : 'border-transparent text-dark/60 hover:text-dark hover:bg-dark/[0.03]'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default DocsPage;
