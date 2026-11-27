import { useSearchParams, Link } from 'react-router-dom';
import { MessageCircle, Phone, Mail, ArrowRight } from 'lucide-react';
import { PROCESS_STEPS } from '../config/defaults';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { EnquiryForm } from '../components/EnquiryForm';
import { buildWhatsAppUrl } from '../utils/validation';

export function CampaignLandingPage() {
  const { settings } = useSite();
  const [searchParams] = useSearchParams();
  const channel = searchParams.get('utm_source') || searchParams.get('ref') || 'social';
  const sourceTag = `social_${channel.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'campaign'}`;

  const telHref = getTelHref(settings.phoneHref);
  const mailtoHref = getMailtoHref(settings.email);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="SG FINANCE Pune | Quick Secured Loan Enquiry Desk"
        description="Official SG FINANCE Pune enquiry desk. Submit a confidential enquiry or connect on WhatsApp for secured lending solutions against eligible pledged movable assets."
        path="/campaign"
      />

      <section className="bg-[#0B1628] text-white py-14 sm:py-22 border-b border-[#B99752]/25">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6 pt-1">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#D4BC85]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
                SG FINANCE · Pune, Maharashtra
              </p>
            </div>

            <h1 className="font-display text-4xl sm:text-[2.85rem] text-white leading-[1.1]">
              Financial Clarity. Built on Trust.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-[1.75]">
              Explore structured secured financial assistance against eligible pledged movable assets with direct, confidential consultation from our Pune office.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
              <a
                href={telHref}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white border border-white/25 hover:border-[#D4BC85] hover:text-[#D4BC85] transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                Call Now
              </a>
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white border border-white/25 hover:border-[#D4BC85] hover:text-[#D4BC85] transition-colors whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                Email Us
              </a>
            </div>

            <div className="pt-6 border-t border-white/12 space-y-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
                Four-Step Process
              </p>
              <ol className="space-y-3 text-sm text-slate-300">
                {PROCESS_STEPS.map((step) => (
                  <li key={step.number} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#D4BC85] tabular-nums pt-0.5 shrink-0">
                      {step.number}
                    </span>
                    <span className="leading-snug">{step.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:col-span-7 text-[#202A36]">
            <EnquiryForm source={sourceTag} compact />
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#F7F5F0] border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#747C86] max-w-3xl leading-relaxed">
            {settings.complianceBannerNote}
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors whitespace-nowrap"
          >
            Explore Services
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
