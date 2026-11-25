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
        title="SG FINANCE | Secured Lending & Financial Services in Pune, Maharashtra"
        description="Explore secured lending solutions and loans against eligible pledged movable assets with SG FINANCE in Pune, Maharashtra. Transparent enquiry process and customer-focused service."
        path="/"
      />

      {/* 1. Hero Section */}
      <section className="relative bg-[#070E1A] text-white overflow-hidden">
        <div className="absolute inset-0">
          <SiteImage
            src={ASSETS.heroOffice}
            alt="SG FINANCE private consultation room in twilight architectural setting"
            eager
            className="w-full h-full object-cover object-center opacity-50"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#070E1A]/95 via-[#0A1628]/85 to-[#0A1628]/45"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs sm:text-sm font-medium tracking-[0.14em] text-[#D4AF5A]">
              Pune, Maharashtra · Secured Financial Services
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.12] tracking-tight text-white">
              {settings.heroHeadline}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
              {settings.heroSubtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/enquire"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors duration-150 whitespace-nowrap"
              >
                Enquire Now
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href={telHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white border border-white/30 hover:border-[#D4AF5A] hover:text-[#D4AF5A] transition-colors duration-150 whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                Call Now
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-0 sm:px-4 py-2 sm:py-3.5 text-sm font-semibold text-slate-200 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-[#D4AF5A] transition-colors duration-150 whitespace-nowrap"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Quiet Institutional Strip */}
        <div className="relative border-t border-white/10 bg-[#070E1A]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm">
            <div>
              <p className="text-[#D4AF5A] font-medium">Secured Lending</p>
              <p className="text-slate-300 mt-0.5">Against eligible movable assets</p>
            </div>
            <div>
              <p className="text-[#D4AF5A] font-medium">Transparent Process</p>
              <p className="text-slate-300 mt-0.5">Clear documentation &amp; steps</p>
            </div>
            <div>
              <p className="text-[#D4AF5A] font-medium">Private Consultation</p>
              <p className="text-slate-300 mt-0.5">Confidential enquiry handling</p>
            </div>
            <div>
              <p className="text-[#D4AF5A] font-medium">Direct Desk</p>
              <a
                href={telHref}
                className="inline-block text-slate-300 hover:text-[#D4AF5A] transition-colors mt-0.5 tabular-nums"
              >
                {settings.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Introduction to SG FINANCE */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
                About SG FINANCE
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1628] leading-tight">
                A disciplined, customer-focused approach to secured lending.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {settings.aboutIntro}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We believe financial assistance should begin with an honest conversation. Whether you are exploring secured liquidity against eligible movable assets or seeking clarity on required documentation, our team guides you through every stage without pressure or ambiguity.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors"
                >
                  Learn more about our philosophy
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] border border-slate-200 overflow-hidden">
                <SiteImage
                  src={ASSETS.aboutLounge}
                  alt="SG FINANCE client consultation lounge with sunlit travertine walls and deep navy seating"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Overview of Financial Services */}
      <section className="py-20 sm:py-24 bg-[#F7F8FA] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
                Our Services
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1628]">
                Structured secured financial solutions in Pune.
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors whitespace-nowrap"
            >
              View all services
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICE_DEFINITIONS.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 p-7 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <p className="font-mono text-xs font-medium text-[#8C6A24] tabular-nums">
                    {service.index}.
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[#0A1628]">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {service.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    to={`/enquire?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors whitespace-nowrap"
                  >
                    Enquire Now
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#8C6A24]" aria-hidden="true" />
                    WhatsApp Enquiry
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-500 leading-relaxed max-w-4xl">
            All service terms, asset eligibility criteria, documentation requirements, and approval decisions are subject to internal business policies and applicable laws in Maharashtra, India.
          </p>
        </div>
      </section>

      {/* 4. How Our Process Works */}
      <section className="py-20 sm:py-24 bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
                How It Works
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
                Four clear steps from enquiry to review.
              </h2>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF5A] hover:text-white transition-colors whitespace-nowrap"
            >
              Explore full process
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.number}
                className="border border-white/12 bg-[#102038] p-6 sm:p-7 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <span className="font-mono text-sm font-medium text-[#D4AF5A] tabular-nums block">
                    Step {step.number}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {step.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-400 leading-relaxed">
            Please note: Submitting an enquiry or participating in an initial consultation does not guarantee loan approval.
          </p>
        </div>
      </section>

      {/* 5. Why Choose SG FINANCE */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            <div className="lg:col-span-5">
              <div className="h-full min-h-[300px] border border-slate-200 overflow-hidden">
                <SiteImage
                  src={ASSETS.servicesDesk}
                  alt="Refined dark slate desk with brass architectural detail and leather portfolio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24] mb-3">
                Why Choose SG FINANCE
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1628] mb-8">
                Built around discretion, clarity, and responsible service.
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                {WHY_CHOOSE_PILLARS.map((pillar) => (
                  <div key={pillar.index} className="space-y-2 border-t border-slate-200 pt-5">
                    <p className="font-mono text-xs text-[#8C6A24] tabular-nums">
                      {pillar.index}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[#0A1628]">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Direct Contact Cards & Customer Enquiry Section */}
      <section className="py-20 sm:py-24 bg-[#F7F8FA] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl space-y-3 mb-10">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
              Direct Contact &amp; Enquiry Desk
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1628] leading-tight">
              Connect with our Pune team directly.
            </h2>
          </div>

          <ContactCardsSection />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A1628] leading-tight">
                Submit your financial requirement online.
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Complete the enquiry form and an authorized SG FINANCE representative will contact you via your preferred method during working hours.
              </p>

              <div className="pt-4 space-y-2.5 border-t border-slate-200 text-sm text-slate-700">
                <p>
                  <span className="text-slate-500">Phone / WhatsApp: </span>
                  <a href={telHref} className="font-semibold text-[#0A1628] hover:text-[#8C6A24] tabular-nums">
                    {settings.phoneDisplay}
                  </a>
                </p>
                <p>
                  <span className="text-slate-500">Official Email: </span>
                  <a href={mailtoHref} className="font-semibold text-[#0A1628] hover:text-[#8C6A24] break-all">
                    {settings.email}
                  </a>
                </p>
              </div>

              <div className="pt-1 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0A1628] border border-slate-300 bg-white hover:border-[#0A1628] transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 text-[#8C6A24]" aria-hidden="true" />
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

      {/* 7. Frequently Asked Questions Preview */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
                Frequently Asked Questions
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1628]">
                Clear answers before you enquire.
              </h2>
            </div>
            <Link
              to="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors whitespace-nowrap"
            >
              All questions
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <FaqAccordion items={FAQ_ITEMS.slice(0, 5)} />
        </div>
      </section>
    </>
  );
}
