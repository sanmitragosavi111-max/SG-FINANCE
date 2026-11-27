import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MessageCircle } from 'lucide-react';
import {
  ASSETS,
  FAQ_ITEMS,
  PROCESS_STEPS,
  SERVICE_DEFINITIONS,
  WHY_CHOOSE_PILLARS,
} from '../config/defaults';
import { getMailtoHref, getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';
import { EnquiryForm } from '../components/EnquiryForm';
import { FaqAccordion } from '../components/FaqAccordion';
import { ContactCardsSection } from '../components/ContactCardsSection';
import { Reveal } from '../components/Reveal';
import { buildWhatsAppUrl } from '../utils/validation';

export function HomePage() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);
  const mailtoHref = getMailtoHref(settings.email);
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );

  return (
    <>
      <SeoHead
        title="SG FINANCE | Financial Clarity. Built on Trust. — Pune, Maharashtra"
        description="Thoughtful secured financial solutions and loans against eligible pledged movable assets in Pune, Maharashtra — guided by transparency, confidentiality, and a professional approach."
        path="/"
      />

      {/* 1. Signature Split Editorial Hero (Warm Ivory Canvas) */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Editorial Column */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-[#B99752]" aria-hidden="true" />
                <p className="text-xs sm:text-[0.8125rem] font-medium tracking-[0.08em] text-[#747C86]">
                  Pune, Maharashtra · Secured Financial Services
                </p>
              </div>

              <h1 className="font-display text-[2.5rem] sm:text-[3.35rem] lg:text-[3.85rem] leading-[1.08] tracking-[-0.01em] text-[#0B1628]">
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-[1.125rem] text-[#4B5563] leading-[1.7] max-w-xl">
                {settings.heroSubtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/enquire"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors duration-150 whitespace-nowrap"
                >
                  Enquire Now
                  <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                </Link>
                <a
                  href={telHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-[#0B1628] bg-white border border-[#0B1628]/20 hover:border-[#B99752] hover:text-[#0B1628] transition-colors duration-150 whitespace-nowrap"
                >
                  <Phone className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                  Speak With Our Team
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-1 sm:px-3 py-2 text-sm font-medium text-[#202A36] hover:text-[#B99752] underline underline-offset-4 decoration-[#B99752]/50 transition-colors duration-150 whitespace-nowrap"
                >
                  Contact Us
                </Link>
              </div>

              {/* Subtle Brand Signature & Direct Desk Strip */}
              <div className="pt-7 mt-4 border-t border-[#E5DFD3] grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-medium text-[#747C86]">Direct Desk</p>
                  <a
                    href={telHref}
                    className="mt-1 inline-block text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors tabular-nums"
                  >
                    {settings.phoneDisplay}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#747C86]">Core Focus</p>
                  <p className="mt-1 text-sm font-medium text-[#202A36]">
                    Pledged Movable Assets
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-medium text-[#747C86]">Consultation</p>
                  <p className="mt-1 text-sm font-medium text-[#202A36]">
                    Confidential &amp; Direct
                  </p>
                </div>
              </div>
            </div>

            {/* Right Editorial Photography Frame */}
            <div className="lg:col-span-6">
              <div className="relative lg:pl-6">
                <div
                  className="hidden sm:block absolute -bottom-4 left-2 right-4 top-6 border border-[#B99752]/35 pointer-events-none"
                  aria-hidden="true"
                />
                <div className="relative bg-[#101F35] overflow-hidden border border-[#E5DFD3] aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/4.6]">
                  <SiteImage
                    src={ASSETS.heroEditorial}
                    alt="Illustrative private financial consultation desk in warm architectural daylight"
                    eager
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[#747C86]">
                  <span className="font-medium text-[#202A36]">SG FINANCE · Pune</span>
                  <span>Secured Lending &amp; Private Consultation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Corporate Editorial Introduction (Pure White) */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="overflow-hidden border border-[#E5DFD3] aspect-[4/3]">
                  <SiteImage
                    src={ASSETS.aboutSanctuary}
                    alt="Illustrative sunlit private advisory lounge with sandstone walls and navy seating"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-3 text-xs text-[#747C86]">
                  Disciplined advisory standards · Pune, Maharashtra
                </p>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-px bg-[#B99752]" aria-hidden="true" />
                  <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                    About SG FINANCE
                  </p>
                </div>

                <h2 className="font-display text-3xl sm:text-[2.65rem] text-[#0B1628] leading-[1.15]">
                  A More Considered Approach to Secured Finance.
                </h2>

                <p className="text-base sm:text-[1.0625rem] text-[#202A36] leading-[1.75] max-w-2xl">
                  {settings.aboutIntro}
                </p>

                <p className="text-[0.9375rem] text-[#4B5563] leading-[1.75] max-w-2xl">
                  We believe meaningful financial assistance starts with a calm, candid conversation. Rather than impersonal forms or vague assurances, our Pune team explains each procedural step, documentation requirement, and evaluation criterion plainly—so you remain informed before making any commitment.
                </p>

                <div className="py-5 border-t border-b border-[#E5DFD3] max-w-2xl">
                  <p className="font-display italic text-lg sm:text-xl text-[#0B1628] leading-relaxed">
                    “Clarity before commitment—every secured facility is grounded in transparent evaluation, written documentation, and respect for your privacy.”
                  </p>
                </div>

                <div className="pt-1">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors"
                  >
                    Read our company profile
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Editorial Asymmetric Services Showcase (Warm Ivory) */}
      <section className="py-20 sm:py-28 bg-[#F7F5F0] border-t border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Sticky Editorial Visual & Framing Left Column */}
            <Reveal className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-px bg-[#B99752]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Our Services
                </p>
              </div>

              <h2 className="font-display text-3xl sm:text-[2.6rem] text-[#0B1628] leading-[1.14]">
                Structured secured financial solutions in Pune.
              </h2>

              <p className="text-[0.9375rem] text-[#4B5563] leading-[1.75]">
                Every requirement is reviewed individually with clear documentation and applicable asset evaluation—without generic templates or pre-packaged assumptions.
              </p>

              <div className="overflow-hidden border border-[#E5DFD3] aspect-[4/3] bg-white">
                <SiteImage
                  src={ASSETS.servicesEvaluation}
                  alt="Illustrative secured-asset evaluation table with leather appraisal tray and brass loupe"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors whitespace-nowrap"
                >
                  Explore all services in detail
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            {/* Numbered Editorial Services List Right Column */}
            <div className="lg:col-span-7 divide-y divide-[#DFD8CA] border-t border-b border-[#DFD8CA]">
              {SERVICE_DEFINITIONS.map((service, idx) => (
                <Reveal key={service.id} delay={idx * 0.05}>
                  <article className="py-8 sm:py-9 group">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-start">
                      <div className="sm:col-span-2">
                        <span className="font-display text-3xl text-[#B99752] tabular-nums leading-none">
                          {service.index}
                        </span>
                      </div>
                      <div className="sm:col-span-10 space-y-3.5">
                        <h3 className="font-display text-2xl sm:text-[1.7rem] text-[#0B1628] group-hover:text-[#101F35] leading-snug">
                          <Link
                            to={`/services#${service.id}`}
                            className="hover:text-[#B99752] transition-colors"
                          >
                            {service.title}
                          </Link>
                        </h3>
                        <p className="text-[0.9375rem] text-[#4B5563] leading-[1.7]">
                          {service.summary}
                        </p>
                        <div className="pt-2 flex flex-wrap items-center gap-6">
                          <Link
                            to={`/enquire?service=${encodeURIComponent(service.title)}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors whitespace-nowrap"
                          >
                            Enquire Now
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </Link>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#747C86] hover:text-[#0B1628] transition-colors whitespace-nowrap"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#B99752]" aria-hidden="true" />
                            WhatsApp Enquiry
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <p className="mt-10 text-xs text-[#747C86] leading-relaxed max-w-4xl">
            All service terms, asset eligibility criteria, documentation requirements, and approval decisions are subject to internal business policies and applicable laws in Maharashtra, India.
          </p>
        </div>
      </section>

      {/* 4. Why SG FINANCE — Four Refined Brand Pillars (Deep Navy Sanctuary) */}
      <section className="py-20 sm:py-28 bg-[#0B1628] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-16">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-px bg-[#D4BC85]" aria-hidden="true" />
                  <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
                    Why SG FINANCE
                  </p>
                </div>
                <h2 className="font-display text-3xl sm:text-[2.75rem] text-white leading-[1.14]">
                  Four principles that govern every client relationship.
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm sm:text-[0.9375rem] text-slate-300 leading-[1.75]">
                  Financial trust is earned through restraint, clear communication, and respect for every customer’s personal circumstances.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-12">
            {WHY_CHOOSE_PILLARS.map((pillar, idx) => (
              <Reveal key={pillar.index} delay={idx * 0.06}>
                <div className="border-t border-[#D4BC85]/35 pt-7 space-y-3.5">
                  <span className="font-display text-3xl text-[#D4BC85] tabular-nums block leading-none">
                    {pillar.index}
                  </span>
                  <h3 className="font-display text-2xl text-white leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-[0.9375rem] text-slate-300/90 leading-[1.75] max-w-lg">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works — Refined Visual Journey (Pure White) */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div className="max-w-2xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-px bg-[#B99752]" aria-hidden="true" />
                  <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                    How It Works
                  </p>
                </div>
                <h2 className="font-display text-3xl sm:text-[2.65rem] text-[#0B1628] leading-[1.14]">
                  A clear, four-stage enquiry journey.
                </h2>
              </div>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors whitespace-nowrap"
              >
                Explore full process
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          {/* Visual Editorial Journey Rail */}
          <div className="relative">
            <div
              className="hidden lg:block absolute top-5 left-0 right-0 h-px bg-[#E5DFD3]"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-7">
              {PROCESS_STEPS.map((step, idx) => (
                <Reveal key={step.number} delay={idx * 0.06}>
                  <div className="relative space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="relative z-10 inline-flex items-center justify-center w-10 h-10 bg-[#F7F5F0] border border-[#B99752]/60 font-mono text-xs font-medium text-[#0B1628] tabular-nums">
                        {step.number}
                      </span>
                      <span className="text-xs font-medium text-[#747C86]">
                        Stage {step.number}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      <h3 className="font-display text-xl sm:text-[1.35rem] text-[#0B1628] leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#4B5563] leading-[1.7]">
                        {step.summary}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Editorial Atmospheric Feature + Disclosure */}
          <Reveal delay={0.1}>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-[#E5DFD3] bg-[#F7F5F0]">
              <div className="lg:col-span-7 overflow-hidden aspect-[16/9]">
                <SiteImage
                  src={ASSETS.processConsultation}
                  alt="Illustrative private financial consultation table with documentation folio and fountain pen"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-5 p-7 sm:p-9 space-y-4">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Important Notice
                </p>
                <h3 className="font-display text-2xl text-[#0B1628] leading-snug">
                  Every decision follows formal verification.
                </h3>
                <p className="text-sm text-[#4B5563] leading-[1.75]">
                  Submitting an enquiry, speaking with our team, or completing an asset review does not guarantee loan approval. All facilities remain subject to documentation verification, internal review, and applicable laws in Maharashtra.
                </p>
                <div className="pt-1">
                  <Link
                    to="/how-it-works"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors"
                  >
                    Read detailed step guidelines
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Prominent Customer Enquiry & Direct Contact Section (Warm Ivory) */}
      <section className="py-20 sm:py-28 bg-[#F7F5F0] border-t border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-3.5 mb-12">
              <div className="flex items-center gap-3">
                <span className="w-6 h-px bg-[#B99752]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Begin a Conversation
                </p>
              </div>
              <h2 className="font-display text-3xl sm:text-[2.75rem] text-[#0B1628] leading-[1.12]">
                Let&apos;s Understand Your Financial Requirements.
              </h2>
              <p className="text-[0.9375rem] sm:text-base text-[#4B5563] leading-[1.75]">
                Reach our Pune consultation desk directly by telephone, WhatsApp, or email—or submit your requirement below for a confidential callback.
              </p>
            </div>
          </Reveal>

          <ContactCardsSection />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-display text-2xl sm:text-3xl text-[#0B1628] leading-snug">
                Prefer to submit your requirement online?
              </h3>
              <p className="text-[0.9375rem] text-[#4B5563] leading-[1.75]">
                Share your contact details and indicative requirement. Your enquiry is recorded confidentially, assigned a reference code, and reviewed by an authorized SG FINANCE representative during working hours.
              </p>

              <div className="pt-5 space-y-3 border-t border-[#DFD8CA] text-sm text-[#202A36]">
                <p>
                  <span className="text-[#747C86]">Phone / WhatsApp: </span>
                  <a
                    href={telHref}
                    className="font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors tabular-nums"
                  >
                    {settings.phoneDisplay}
                  </a>
                </p>
                <p>
                  <span className="text-[#747C86]">Official Email: </span>
                  <a
                    href={mailtoHref}
                    className="font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors break-all"
                  >
                    {settings.email}
                  </a>
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/enquire"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
                >
                  Enquire Now
                  <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                </Link>
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
                  href={mailtoHref}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#0B1628] border border-[#0B1628]/25 bg-white hover:border-[#0B1628] transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
                  Email Us
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <EnquiryForm source="website_home" compact />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions Preview (Pure White) */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-px bg-[#B99752]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Frequently Asked Questions
                </p>
              </div>
              <h2 className="font-display text-3xl sm:text-[2.4rem] text-[#0B1628] leading-[1.15]">
                Clear answers before you enquire.
              </h2>
              <p className="text-sm text-[#4B5563] leading-[1.75]">
                Straightforward explanations of how our secured lending enquiry, documentation, and evaluation process works in Pune.
              </p>
              <div className="pt-2">
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors whitespace-nowrap"
                >
                  View all questions
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8">
              <FaqAccordion items={FAQ_ITEMS.slice(0, 5)} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
