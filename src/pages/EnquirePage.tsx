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

      <section className="bg-[#0A1628] text-white py-14 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              Confidential Enquiry Form · Pune, Maharashtra
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
              Submit your financial enquiry.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Share your requirement below. Our authorized team will reach out via your preferred channel to explain the next steps clearly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 pb-24 sm:py-20 sm:pb-24 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <EnquiryForm
                source={sourceLabel}
                defaultRequirement={defaultRequirement}
              />
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-[#0A1628]">
                  <ShieldCheck className="w-5 h-5 text-[#8C6A24]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold">
                    What Happens Next
                  </h2>
                </div>
                <ol className="space-y-3 text-sm text-slate-600 list-decimal pl-4">
                  <li>Your enquiry is logged securely with a unique reference code.</li>
                  <li>An authorized SG FINANCE team member contacts you during working hours.</li>
                  <li>We outline applicable documentation and asset evaluation steps clearly.</li>
                </ol>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
                  Submitting this enquiry does not obligate you to borrow and does not guarantee loan approval.
                </p>
              </div>

              <div className="bg-[#0A1628] text-white p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold">
                  Need Immediate Assistance?
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect directly with our Pune consultation desk by phone, WhatsApp, or email.
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href={telHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white border border-white/25 hover:border-white/60 transition-colors tabular-nums"
                  >
                    <Phone className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                    Call {settings.phoneDisplay}
                  </a>
                  <a
                    href={mailtoHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white border border-white/25 hover:border-white/60 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
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
