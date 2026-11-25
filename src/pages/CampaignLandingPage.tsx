import { useSearchParams, Link } from 'react-router-dom';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { ASSETS, PROCESS_STEPS } from '../config/defaults';
import { getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';
import { EnquiryForm } from '../components/EnquiryForm';
import { buildWhatsAppUrl } from '../utils/validation';

export function CampaignLandingPage() {
  const { settings } = useSite();
  const [searchParams] = useSearchParams();
  const channel = searchParams.get('utm_source') || searchParams.get('ref') || 'social';
  const sourceTag = `social_${channel.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'campaign'}`;

  const telHref = getTelHref(settings.phoneHref);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="SG FINANCE Pune | Quick Secured Loan Enquiry Desk"
        description="Official SG FINANCE Pune social landing page. Submit a confidential enquiry or connect on WhatsApp for secured lending solutions against eligible pledged movable assets."
        path="/campaign"
      />

      <section className="relative bg-[#070E1A] text-white py-14 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <SiteImage
            src={ASSETS.ogShareCard}
            alt="SG FINANCE architectural backdrop"
            eager
            className="w-full h-full object-cover opacity-55"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#070E1A]/85 via-[#0A1628]/85 to-[#070E1A]"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6 pt-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              SG FINANCE · Pune, Maharashtra
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              Secured Lending Solutions Built Around Trust.
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Explore structured secured financial assistance against eligible pledged movable assets with direct consultation from our Pune office.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
              <a
                href={telHref}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white border border-white/30 hover:border-white/70 transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                Call Now
              </a>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-3">
              <p className="text-xs font-medium text-[#D4AF5A]">How Our Enquiry Works</p>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-300">
                {PROCESS_STEPS.map((step) => (
                  <li key={step.number} className="flex items-start gap-2.5">
                    <span className="font-mono text-[#D4AF5A] tabular-nums shrink-0">
                      {step.number}.
                    </span>
                    <span>{step.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:col-span-7 text-slate-900">
            <EnquiryForm source={sourceTag} compact />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            {settings.complianceBannerNote}
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors whitespace-nowrap"
          >
            Explore Services
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
