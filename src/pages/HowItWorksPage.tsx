import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { ASSETS, PROCESS_STEPS } from '../config/defaults';
import { getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';
import { Reveal } from '../components/Reveal';
import { buildWhatsAppUrl } from '../utils/validation';

export function HowItWorksPage() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="How It Works | Four-Step Secured Loan Enquiry Process — SG FINANCE"
        description="Learn how the SG FINANCE enquiry process works in Pune: submit your enquiry, discuss requirements, asset evaluation and documentation where applicable, and application review."
        path="/how-it-works"
      />

      {/* Deep Navy Editorial Header */}
      <section className="bg-[#0B1628] text-white py-16 sm:py-22 border-b border-[#B99752]/25">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-7 h-px bg-[#D4BC85]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
                  How It Works · SG FINANCE
                </p>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-white leading-[1.1]">
                A clear, four-stage path from initial enquiry to formal review.
              </h1>
              <p className="text-base text-slate-300 leading-[1.75] max-w-2xl">
                We structure every customer interaction around predictability and respect—so you always understand what details are requested, how asset evaluation works, and what happens next.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="overflow-hidden border border-white/15 aspect-[16/10]">
                <SiteImage
                  src={ASSETS.processConsultation}
                  alt="Illustrative private financial consultation desk with documentation folder"
                  eager
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Four-Step Editorial Journey */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Sticky Summary Column */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Process Overview
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-[#0B1628] leading-snug">
                  No unstated commitments at any step.
                </h2>
                <p className="text-sm text-[#4B5563] leading-[1.75]">
                  An initial enquiry or consultation carries zero obligation. You review every requirement and written condition before choosing whether to proceed.
                </p>
              </div>

              <div className="bg-[#F7F5F0] border border-[#E5DFD3] p-6 space-y-3">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Important Clarification
                </p>
                <p className="text-sm text-[#202A36] leading-relaxed">
                  Submitting an online enquiry, speaking with a representative, or undergoing asset evaluation does not guarantee loan approval. Every application remains subject to verification, internal business decision, documentation completion, and applicable laws in Maharashtra.
                </p>
              </div>
            </aside>

            {/* Right Vertical Stepped Timeline */}
            <div className="lg:col-span-8 divide-y divide-[#E5DFD3] border-t border-b border-[#E5DFD3]">
              {PROCESS_STEPS.map((step, idx) => (
                <Reveal key={step.number} delay={idx * 0.05}>
                  <div className="py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-8 items-start">
                    <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-start gap-3">
                      <span className="inline-flex items-center justify-center w-12 h-12 bg-[#F7F5F0] border border-[#B99752]/65 font-display text-xl text-[#0B1628] tabular-nums">
                        {step.number}
                      </span>
                      <span className="text-xs font-medium text-[#747C86]">
                        Stage {step.number} of 04
                      </span>
                    </div>
                    <div className="sm:col-span-9 space-y-3">
                      <h3 className="font-display text-2xl sm:text-[1.85rem] text-[#0B1628] leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-base text-[#202A36] leading-[1.7]">
                        {step.summary}
                      </p>
                      <p className="text-sm text-[#4B5563] leading-[1.75]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Refined Conversion Band */}
          <Reveal>
            <div className="mt-16 bg-[#F7F5F0] border border-[#E5DFD3] p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2.5 max-w-xl">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Step 01 · Begin Confidentially
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-[#0B1628]">
                  Ready to discuss your financial requirement?
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  Submit your enquiry online, speak directly with our Pune desk, or message us on WhatsApp.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/enquire"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
                >
                  Enquire Now
                  <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  WhatsApp
                </a>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#0B1628] transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                  Call Now
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
