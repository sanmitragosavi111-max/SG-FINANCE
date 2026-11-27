import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { ASSETS, WHY_CHOOSE_PILLARS } from '../config/defaults';
import { getTelHref } from '../config/contact';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';
import { Reveal } from '../components/Reveal';

const COMMITMENTS = [
  {
    index: '01',
    title: 'Our Business Philosophy',
    body: 'Financial relationships endure when expectations are set honestly from day one. We focus on clear communication, orderly documentation, and respectful customer interactions rather than rushed promises.',
  },
  {
    index: '02',
    title: 'Personalised Client Attention',
    body: 'Every customer’s financial context is unique. Our Pune team takes the time to listen, clarify procedural steps, and answer questions patiently before any formal commitment is considered.',
  },
  {
    index: '03',
    title: 'Uncompromising Transparency',
    body: 'We communicate eligibility considerations, required documents, and formal written terms plainly so customers can review every detail with complete clarity.',
  },
  {
    index: '04',
    title: 'Responsible Financial Practices',
    body: 'We operate with adherence to formal review procedures and applicable legal standards in Maharashtra, India, encouraging prudent borrowing aligned with actual requirements.',
  },
  {
    index: '05',
    title: 'Discretion and Confidentiality',
    body: 'Personal details, enquiry records, and discussions concerning pledged movable assets are handled strictly on a confidential basis with controlled staff access.',
  },
  {
    index: '06',
    title: 'Institutional Discipline',
    body: 'From the first enquiry to scheduled office consultations, we uphold consistent standards of courtesy, responsiveness, and thorough record-keeping.',
  },
];

export function AboutPage() {
  const { settings } = useSite();
  const telHref = getTelHref(settings.phoneHref);

  return (
    <>
      <SeoHead
        title="About SG FINANCE | Secured Financial Services in Pune, Maharashtra"
        description="Learn about SG FINANCE in Pune, Maharashtra — our business philosophy, personalised assistance, transparency, confidentiality, and responsible financial practices."
        path="/about"
      />

      {/* Editorial Company Profile Opening (Warm Ivory) */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] py-16 sm:py-22">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#B99752]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                Company Profile · Pune, Maharashtra
              </p>
            </div>
            <h1 className="font-display text-4xl sm:text-[3.25rem] text-[#0B1628] leading-[1.1]">
              Financial services grounded in trust, discretion, and accountability.
            </h1>
            <p className="text-base sm:text-lg text-[#4B5563] leading-[1.75]">
              Serving individuals and business owners in Pune, Maharashtra with secured lending assistance built around transparent evaluation and direct human guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Spread: Who We Are */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Who We Are
                </p>
                <h2 className="font-display text-3xl sm:text-[2.35rem] text-[#0B1628] leading-[1.16]">
                  A dedicated secured lending desk in Pune, Maharashtra.
                </h2>
                <p className="text-base text-[#202A36] leading-[1.8]">
                  {settings.aboutIntro}
                </p>
                <p className="text-[0.9375rem] text-[#4B5563] leading-[1.8]">
                  Rather than treating enquiries as impersonal transactions, SG FINANCE emphasizes direct, respectful human assistance. Customers know who they are speaking with, what documentation is needed, how eligible pledged movable assets are evaluated, and how their personal information is safeguarded.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="overflow-hidden border border-[#E5DFD3] aspect-[4/3]">
                  <SiteImage
                    src={ASSETS.aboutSanctuary}
                    alt="Illustrative sunlit private advisory lounge with teak architectural louvers"
                    eager
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-3 text-xs text-[#747C86]">
                  Illustrative private consultation atmosphere · SG FINANCE, Pune
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Philosophy Statement Band (Deep Navy) */}
      <section className="py-16 sm:py-22 bg-[#0B1628] text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-6">
          <p className="text-xs font-semibold tracking-[0.08em] text-[#D4BC85]">
            Our Guiding Standard
          </p>
          <p className="font-display italic text-2xl sm:text-4xl text-white leading-[1.35]">
            “Trust in financial services is never claimed—it is demonstrated through plain language, orderly documentation, and quiet discretion.”
          </p>
          <p className="text-xs text-slate-400">
            SG FINANCE · Secured Financial Services · Pune, Maharashtra
          </p>
        </div>
      </section>

      {/* Six Institutional Standards */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-3 mb-14">
              <div className="flex items-center gap-3">
                <span className="w-6 h-px bg-[#B99752]" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Standards of Practice
                </p>
              </div>
              <h2 className="font-display text-3xl sm:text-[2.4rem] text-[#0B1628] leading-[1.15]">
                The principles that shape every customer interaction.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {COMMITMENTS.map((item, idx) => (
              <Reveal key={item.index} delay={idx * 0.04}>
                <div className="border-t border-[#E5DFD3] pt-7 space-y-3">
                  <span className="font-display text-2xl text-[#B99752] tabular-nums block leading-none">
                    {item.index}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-[#0B1628]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] leading-[1.75]">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Direct Team Invitation */}
          <Reveal>
            <div className="mt-20 bg-[#F7F5F0] border border-[#E5DFD3] p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2.5 max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                  Speak With Our Team
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-[#0B1628]">
                  Have questions about secured lending or documentation?
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  {WHY_CHOOSE_PILLARS[1].description}
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
