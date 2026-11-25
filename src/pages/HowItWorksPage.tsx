import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { PROCESS_STEPS } from '../config/defaults';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { buildWhatsAppUrl } from '../utils/validation';

export function HowItWorksPage() {
  const { settings } = useSite();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="How It Works | Four-Step Secured Loan Enquiry Process — SG FINANCE"
        description="Learn how the SG FINANCE enquiry process works in Pune: submit your enquiry, discuss requirements, asset evaluation and documentation where applicable, and application review."
        path="/how-it-works"
      />

      <section className="bg-[#0A1628] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              How It Works
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              A clear, four-step path from initial enquiry to review.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              We keep our process straightforward so you always know what information is requested, how evaluation takes place, and what happens next.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
              >
                <div className="md:col-span-3">
                  <span className="font-mono text-sm font-medium text-[#8C6A24] tabular-nums">
                    Step {step.number}
                  </span>
                </div>
                <div className="md:col-span-9 space-y-3">
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A1628]">
                    {step.title}
                  </h2>
                  <p className="text-base text-slate-700 leading-relaxed">
                    {step.summary}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Explicit Non-Guarantee Disclosure */}
          <div className="mt-12 bg-[#F7F8FA] border border-slate-200 p-6 sm:p-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#0A1628]">
              Important Clarification on Approval
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Submitting an online enquiry, speaking with a representative, or undergoing asset evaluation does not guarantee loan approval. Every application is subject to verification, internal business decision, documentation completion, and compliance with applicable laws in Maharashtra, India.
            </p>
          </div>

          {/* CTA Band */}
          <div className="mt-12 bg-[#0A1628] text-white p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                Ready to start Step 01?
              </h2>
              <p className="text-sm text-slate-300">
                Submit your enquiry online or message our Pune desk on WhatsApp for a guided consultation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/enquire"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors whitespace-nowrap"
              >
                Enquire Now
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-white/25 hover:border-white/60 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
