import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { FAQ_ITEMS } from '../config/defaults';
import { getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { FaqAccordion } from '../components/FaqAccordion';
import { buildWhatsAppUrl } from '../utils/validation';

export function FaqPage() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SeoHead
        title="Frequently Asked Questions | Secured Loans in Pune — SG FINANCE"
        description="Read clear answers about secured loans, the SG FINANCE enquiry process, required documentation, asset evaluation, eligibility, and how to contact our Pune office."
        path="/faq"
        structuredData={faqSchema}
      />

      {/* Editorial Warm Ivory Header */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#B99752]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                Frequently Asked Questions
              </p>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[#0B1628] leading-[1.1]">
              Straightforward answers before you enquire.
            </h1>
            <p className="text-base text-[#4B5563] leading-[1.75]">
              Clear, factual explanations of secured lending procedures, documentation considerations, pledged asset evaluation, and how to reach SG FINANCE in Pune.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Sticky Help Column */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="bg-[#F7F5F0] border border-[#E5DFD3] p-7 space-y-4">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Personalised Assistance
                </p>
                <h2 className="font-display text-2xl text-[#0B1628] leading-snug">
                  Have a question specific to your situation?
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  Speak directly with our Pune desk or submit a confidential enquiry for straightforward guidance.
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    to="/enquire"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
                  >
                    Enquire Now
                    <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                  <a
                    href={telHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#0B1628] transition-colors tabular-nums whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                    {settings.phoneDisplay}
                  </a>
                </div>
              </div>
            </aside>

            {/* Right Accordion Column */}
            <div className="lg:col-span-8">
              <FaqAccordion items={FAQ_ITEMS} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
