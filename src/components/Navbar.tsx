import { useState } from 'react';
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
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#070E1A]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-6 lg:gap-8">
        {/* Zone 1: Single clean Brand Wordmark */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          aria-label="SG FINANCE Home"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF5A] rounded-xs"
        >
          <BrandMark tone="light" />
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#D4AF5A] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-[#D4AF5A]'
                    : 'text-slate-200 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Call Now + Primary Enquire Now CTA + Mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={telHref}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-100 border border-white/20 hover:border-[#D4AF5A] hover:text-[#D4AF5A] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF5A] shrink-0" aria-hidden="true" />
            Call Now
          </a>

          <Link
            to="/enquire"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Enquire Now
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-slate-200 hover:text-white border border-white/15 cursor-pointer"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#0A1628] border-b border-white/15 px-5 py-6">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-3 text-base font-medium border-b border-white/10 ${
                  isActive ? 'text-[#D4AF5A]' : 'text-slate-100'
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
                  `px-3 py-3 text-base font-medium border-b border-white/10 ${
                    isActive ? 'text-[#D4AF5A]' : 'text-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-4 grid grid-cols-2 gap-3">
              <a
                href={telHref}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white border border-white/25 hover:border-[#D4AF5A] transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                Call Now
              </a>
              <Link
                to="/enquire"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors whitespace-nowrap"
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
