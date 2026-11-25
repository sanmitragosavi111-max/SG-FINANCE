import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../config/defaults';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { FaqAccordion } from '../components/FaqAccordion';
import { buildWhatsAppUrl } from '../utils/validation';

export function FaqPage() {
  const { settings } = useSite();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
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

      <section className="bg-[#0A1628] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              Frequently Asked Questions
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Straightforward answers about our enquiry and review process.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Find clear, transparent information on secured loans, documentation, evaluation procedures, and how to connect with SG FINANCE in Pune.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <FaqAccordion items={FAQ_ITEMS} />

          <div className="mt-14 bg-[#F7F8FA] border border-slate-200 p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-semibold text-[#0A1628]">
                Still have a specific question?
              </h2>
              <p className="text-sm text-slate-600">
                Submit an enquiry or message our team directly on WhatsApp for personal assistance.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/enquire"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
              >
                Enquire Now
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0A1628] border border-slate-300 bg-white hover:border-[#0A1628] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#8C6A24]" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
