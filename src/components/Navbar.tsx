import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Phone, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useSite } from '../context/SiteContext';
import { getTelHref } from '../config/contact';

const NAV_ITEMS = [
  { to: '/services', label: 'Services' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-[60px] md:h-[76px] transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5DFD3] shadow-[0_1px_12px_rgba(11,22,40,0.05)]'
          : 'bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E5DFD3]/80'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-6 lg:gap-8">
        {/* Zone 1: Clean single-line Brand Mark */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          aria-label="SG FINANCE Home"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99752] rounded-xs"
        >
          <BrandMark tone="dark" />
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 lg:gap-8 text-[0.9375rem] font-medium"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[1.5px] after:bg-[#B99752] after:origin-left after:transition-transform after:duration-200 ${
                  isActive
                    ? 'text-[#0B1628] after:scale-x-100'
                    : 'text-[#4B5563] hover:text-[#0B1628] after:scale-x-0 hover:after:scale-x-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Direct Call link + Primary Enquire Now CTA + Mobile menu toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href={telHref}
            className="hidden lg:inline-flex items-center gap-2 text-sm font-medium text-[#202A36] hover:text-[#B99752] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-[#B99752] shrink-0" aria-hidden="true" />
            Call Now
          </a>

          <Link
            to="/enquire"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] border border-[#0B1628] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Enquire Now
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#0B1628] border border-[#E5DFD3] bg-white hover:border-[#B99752] transition-colors cursor-pointer"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5DFD3] shadow-lg px-5 py-6">
          <nav aria-label="Mobile Navigation" className="flex flex-col">
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `py-3.5 text-base font-medium border-b border-[#F0ECE4] transition-colors ${
                  isActive ? 'text-[#B99752]' : 'text-[#0B1628]'
                }`
              }
            >
              Home
            </NavLink>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `py-3.5 text-base font-medium border-b border-[#F0ECE4] transition-colors ${
                    isActive ? 'text-[#B99752]' : 'text-[#0B1628]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-5 grid grid-cols-2 gap-3">
              <a
                href={telHref}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#0B1628] border border-[#0B1628]/25 hover:border-[#0B1628] transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                Call Now
              </a>
              <Link
                to="/enquire"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
              >
                Enquire Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
