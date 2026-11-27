import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { SeoHead } from '../components/SeoHead';
import { EnquiryForm } from '../components/EnquiryForm';
import { REQUIREMENT_TYPES } from '../types/site';
import { buildWhatsAppUrl } from '../utils/validation';

export function EnquirePage() {
  const { settings } = useSite();
  const [searchParams] = useSearchParams();

  const requestedService = searchParams.get('service') || '';
  const defaultRequirement = (REQUIREMENT_TYPES as readonly string[]).includes(requestedService)
    ? requestedService
    : REQUIREMENT_TYPES[0];

  const utmSource = searchParams.get('utm_source')?.trim();
  const sourceLabel = utmSource ? `enquire_${utmSource.slice(0, 30)}` : 'website_enquire';

  const telHref = getTelHref(settings.phoneHref);
  const mailtoHref = getMailtoHref(settings.email);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="Enquire Now | Secured Loan Enquiry in Pune — SG FINANCE"
        description="Submit a confidential secured loan enquiry with SG FINANCE in Pune, Maharashtra. Our authorized team will contact you via your preferred method."
        path="/enquire"
      />

      {/* Focused Warm Ivory Header */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#B99752]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                Confidential Enquiry · Pune, Maharashtra
              </p>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[#0B1628] leading-[1.1]">
              Let&apos;s understand your financial requirement.
            </h1>
            <p className="text-base text-[#4B5563] leading-[1.75]">
              Share your basic details below. An authorized SG FINANCE representative will contact you via your preferred channel during business working hours to explain the next steps clearly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 pb-24 sm:py-20 sm:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <EnquiryForm
                source={sourceLabel}
                defaultRequirement={defaultRequirement}
              />
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[#F7F5F0] border border-[#E5DFD3] p-7 space-y-5">
                <div className="flex items-center gap-2.5 text-[#0B1628]">
                  <ShieldCheck className="w-5 h-5 text-[#B99752]" aria-hidden="true" />
                  <h2 className="font-display text-xl text-[#0B1628]">
                    What Happens Next
                  </h2>
                </div>
                <ol className="space-y-4 text-sm text-[#4B5563]">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#B99752] tabular-nums pt-0.5 shrink-0">
                      01
                    </span>
                    <span className="leading-relaxed">
                      Your enquiry is recorded securely and assigned a unique reference number.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#B99752] tabular-nums pt-0.5 shrink-0">
                      02
                    </span>
                    <span className="leading-relaxed">
                      An authorized SG FINANCE team member contacts you during working hours.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#B99752] tabular-nums pt-0.5 shrink-0">
                      03
                    </span>
                    <span className="leading-relaxed">
                      We outline applicable documentation and asset evaluation procedures clearly.
                    </span>
                  </li>
                </ol>
                <p className="text-xs text-[#747C86] pt-4 border-t border-[#E5DFD3] leading-relaxed">
                  Submitting this enquiry carries zero obligation to borrow and does not guarantee loan approval.
                </p>
              </div>

              <div className="bg-[#0B1628] text-white p-7 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
                    Direct Desk
                  </p>
                  <h2 className="font-display text-2xl text-white">
                    Prefer to speak directly?
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connect with our Pune consultation desk by telephone, WhatsApp, or email.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={telHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors tabular-nums"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Call {settings.phoneDisplay}
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white border border-white/25 hover:border-[#D4BC85] hover:text-[#D4BC85] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href={mailtoHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white border border-white/25 hover:border-[#D4BC85] hover:text-[#D4BC85] transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                    Email Us
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
