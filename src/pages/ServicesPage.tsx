import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle, Phone } from 'lucide-react';
import { ASSETS, SERVICE_DEFINITIONS } from '../config/defaults';
import { getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';
import { Reveal } from '../components/Reveal';
import { buildWhatsAppUrl } from '../utils/validation';

export function ServicesPage() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
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

      {/* Editorial Split Page Header (Warm Ivory) */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-7 h-px bg-[#B99752]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Our Services · Pune, Maharashtra
                </p>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-[#0B1628] leading-[1.1]">
                Secured financial services structured around clarity and discretion.
              </h1>
              <p className="text-base text-[#4B5563] leading-[1.75] max-w-2xl">
                SG FINANCE offers secured lending and customer consultation services focused on eligible pledged movable assets, governed by transparent procedures, formal documentation, and applicable laws in Maharashtra.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/enquire"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
                >
                  Enquire Now
                  <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                </Link>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#B99752] transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                  Speak With Our Team
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden border border-[#E5DFD3] aspect-[4/3] bg-white">
                <SiteImage
                  src={ASSETS.servicesEvaluation}
                  alt="Illustrative secured-asset appraisal desk with leather tray and precision loupe"
                  eager
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Editorial Index Bar */}
      <section className="bg-white border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm">
          {SERVICE_DEFINITIONS.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="inline-flex items-center gap-2 text-[#4B5563] hover:text-[#0B1628] transition-colors"
            >
              <span className="font-mono text-[#B99752] tabular-nums">{service.index}</span>
              <span>{service.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Detailed Service Dossiers */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 divide-y divide-[#E5DFD3] border-b border-[#E5DFD3]">
          {SERVICE_DEFINITIONS.map((service, idx) => (
            <Reveal key={service.id}>
              <article id={service.id} className="py-12 sm:py-16 first:pt-0 scroll-mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-4xl text-[#B99752] tabular-nums leading-none">
                        {service.index}
                      </span>
                      <span className="text-xs font-medium text-[#747C86]">
                        Service Area {idx + 1} of {SERVICE_DEFINITIONS.length}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl sm:text-[2.15rem] text-[#0B1628] leading-snug">
                      {service.title}
                    </h2>
                    <p className="text-base text-[#202A36] leading-[1.75]">
                      {service.summary}
                    </p>
                    <p className="text-[0.9375rem] text-[#4B5563] leading-[1.75]">
                      {service.details}
                    </p>
                  </div>

                  <div className="lg:col-span-5 bg-[#F7F5F0] border border-[#E5DFD3] p-6 sm:p-8 space-y-6">
                    <h3 className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                      Eligibility &amp; Evaluation Considerations
                    </h3>
                    <ul className="space-y-3.5">
                      {service.keyPoints.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-sm text-[#202A36] leading-relaxed"
                        >
                          <Check
                            className="w-4 h-4 text-[#B99752] shrink-0 mt-1"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-[#E5DFD3] flex flex-wrap items-center gap-3">
                      <Link
                        to={`/enquire?service=${encodeURIComponent(service.title)}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
                      >
                        Enquire Now
                        <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                      </Link>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#0B1628] transition-colors whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                        WhatsApp Enquiry
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Transparent Conditions & Governance Band (Deep Navy) */}
      <section className="py-16 sm:py-20 bg-[#0B1628] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
                Transparent Conditions &amp; Governance
              </p>
              <h2 className="font-display text-2xl sm:text-3xl text-white leading-snug">
                Every facility is governed strictly by individual verification and written documentation.
              </h2>
              <p className="text-sm sm:text-[0.9375rem] text-slate-300 leading-[1.75]">
                We do not publish generic promises, indicative interest rates, or pre-determined lending limits online. {settings.complianceBannerNote} Review our{' '}
                <Link
                  to="/loan-terms"
                  className="text-[#D4BC85] underline underline-offset-4 hover:text-white"
                >
                  Loan Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link
                  to="/disclaimer"
                  className="text-[#D4BC85] underline underline-offset-4 hover:text-white"
                >
                  Disclaimer
                </Link>{' '}
                for full disclosures.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
              >
                View 4-Step Process
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
