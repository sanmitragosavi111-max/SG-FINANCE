import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useSite } from '../context/SiteContext';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl, sanitizeExternalUrl } from '../utils/validation';

export function Footer() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const mailtoHref = getMailtoHref(settings.email);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );
  const instagramHref = sanitizeExternalUrl(settings.instagramUrl);
  const facebookHref = sanitizeExternalUrl(settings.facebookUrl);
  const linkedinHref = sanitizeExternalUrl(settings.linkedinUrl);

  return (
    <footer className="bg-[#0B1628] text-slate-300 border-t border-[#B99752]/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" aria-label="SG FINANCE Home" className="inline-block">
              <BrandMark tone="light" size="lg" />
            </Link>
            <p className="text-sm text-slate-300/90 leading-relaxed max-w-sm">
              Thoughtful secured financial services and lending against eligible pledged movable assets in Pune, Maharashtra — guided by transparency, discretion, and responsible practices.
            </p>
            <p className="text-xs text-[#D4BC85]/90 tracking-wide">
              {settings.cityRegion}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-5">Navigation</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-[#D4BC85] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#D4BC85] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#D4BC85] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D4BC85] transition-colors">
                  About SG FINANCE
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#D4BC85] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/enquire" className="hover:text-[#D4BC85] transition-colors">
                  Enquire Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance Column */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-white mb-5">Legal &amp; Governance</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#D4BC85] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#D4BC85] transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-[#D4BC85] transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/loan-terms" className="hover:text-[#D4BC85] transition-colors">
                  Loan Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/campaign" className="hover:text-[#D4BC85] transition-colors">
                  Quick Enquiry Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social Column */}
          <div className="lg:col-span-3 space-y-5">
            <h2 className="text-sm font-semibold text-white">Contact Desk</h2>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4BC85] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed">
                  {settings.addressLine}, {settings.cityRegion}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4BC85] shrink-0" aria-hidden="true" />
                <a
                  href={telHref}
                  className="hover:text-[#D4BC85] transition-colors tabular-nums"
                >
                  {settings.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4BC85] shrink-0" aria-hidden="true" />
                <a
                  href={mailtoHref}
                  className="hover:text-[#D4BC85] transition-colors break-all"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#D4BC85] shrink-0" aria-hidden="true" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4BC85] transition-colors"
                >
                  Chat With Us on WhatsApp
                </a>
              </li>
            </ul>

            <div className="pt-1 flex flex-wrap gap-2.5">
              <a
                href={telHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                Call Now
              </a>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white border border-white/25 hover:border-[#D4BC85] hover:text-[#D4BC85] transition-colors whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5 text-[#D4BC85]" aria-hidden="true" />
                Email Us
              </a>
            </div>

            <div className="pt-1">
              <p className="text-xs text-slate-400 mb-2">Connect</p>
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs font-medium">
                {instagramHref ? (
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-[#D4BC85] transition-colors"
                  >
                    Instagram
                  </a>
                ) : (
                  <Link to="/contact" className="text-slate-400 hover:text-slate-200 transition-colors">
                    Instagram
                  </Link>
                )}
                <span className="text-slate-600" aria-hidden="true">·</span>
                {facebookHref ? (
                  <a
                    href={facebookHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-[#D4BC85] transition-colors"
                  >
                    Facebook
                  </a>
                ) : (
                  <Link to="/contact" className="text-slate-400 hover:text-slate-200 transition-colors">
                    Facebook
                  </Link>
                )}
                <span className="text-slate-600" aria-hidden="true">·</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-200 hover:text-[#D4BC85] transition-colors"
                >
                  WhatsApp
                </a>
                <span className="text-slate-600" aria-hidden="true">·</span>
                {linkedinHref ? (
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-[#D4BC85] transition-colors"
                  >
                    LinkedIn
                  </a>
                ) : (
                  <Link to="/contact" className="text-slate-400 hover:text-slate-200 transition-colors">
                    LinkedIn
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Notice & Copyright */}
        <div className="pt-8 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed max-w-5xl">
            {settings.complianceBannerNote} SG FINANCE is not a bank, NBFC, or RBI-regulated deposit-taking institution unless explicitly stated with verified statutory registration particulars.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} SG FINANCE, Pune, Maharashtra. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="hover:text-[#D4BC85] transition-colors">
                Staff Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
