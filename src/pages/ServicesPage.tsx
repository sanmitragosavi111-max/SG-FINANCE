import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { ASSETS, SERVICE_DEFINITIONS } from '../config/defaults';
import { OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';
import { buildWhatsAppUrl } from '../utils/validation';

export function ServicesPage() {
  const { settings } = useSite();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="Our Services | Secured Loan Services in Pune — SG FINANCE"
        description="Explore SG FINANCE services in Pune: Secured Lending Solutions, Loan Against Eligible Pledged Assets, Short-Term Financial Assistance, and Customer Consultation."
        path="/services"
      />

      {/* Page Header */}
      <section className="bg-[#0A1628] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              Our Services · Pune, Maharashtra
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Secured financial services structured around clarity and trust.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              SG FINANCE offers secured lending and customer consultation services focused on eligible pledged movable assets, governed by transparent procedures and applicable laws.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Feature Banner */}
      <section className="bg-white pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch border border-slate-200 bg-[#F7F8FA]">
            <div className="lg:col-span-5 min-h-[260px]">
              <SiteImage
                src={ASSETS.servicesDesk}
                alt="Private secured lending consultation desk with portfolio documents"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center space-y-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
                Transparent Conditions
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A1628]">
                Every facility is tailored to verified eligibility and formal documentation.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We do not publish generic promises or pre-determined lending limits online. Collateral eligibility, valuation criteria, applicable terms, and repayment structures are reviewed individually during consultation and set forth exclusively in formal written agreements subject to applicable Maharashtra laws.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Breakdown */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
          {SERVICE_DEFINITIONS.map((service) => (
            <article
              key={service.id}
              id={service.id}
              className="border border-slate-200 p-7 sm:p-10 bg-white"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <p className="font-mono text-xs font-medium text-[#8C6A24] tabular-nums">
                    {service.index}.
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A1628]">
                    {service.title}
                  </h2>
                  <p className="text-base text-slate-700 leading-relaxed">
                    {service.summary}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {service.details}
                  </p>
                </div>

                <div className="lg:col-span-5 lg:border-l lg:border-slate-200 lg:pl-8 space-y-5">
                  <h3 className="text-xs font-semibold tracking-[0.12em] text-slate-500">
                    Service Considerations
                  </h3>
                  <ul className="space-y-3">
                    {service.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-[#8C6A24] shrink-0 mt-1" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/enquire?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
                    >
                      Enquire Now
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0A1628] border border-slate-300 bg-white hover:border-[#0A1628] transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4 text-[#8C6A24]" aria-hidden="true" />
                      WhatsApp Enquiry
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Compliance Note */}
          <div className="bg-[#F7F8FA] border border-slate-200 p-6 sm:p-8 space-y-2">
            <h2 className="text-sm font-semibold text-[#0A1628]">
              Important Regulatory &amp; Eligibility Notice
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {settings.complianceBannerNote} Please review our{' '}
              <Link to="/loan-terms" className="text-[#0A1628] underline underline-offset-2 hover:text-[#8C6A24]">
                Loan Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/disclaimer" className="text-[#0A1628] underline underline-offset-2 hover:text-[#8C6A24]">
                Disclaimer
              </Link>{' '}
              for full governance disclosures.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
