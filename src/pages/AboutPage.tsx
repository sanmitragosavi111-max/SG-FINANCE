import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ASSETS, WHY_CHOOSE_PILLARS } from '../config/defaults';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { SiteImage } from '../components/SiteImage';

const COMMITMENTS = [
  {
    index: '01',
    title: 'Our Business Philosophy',
    body: 'Financial relationships endure when expectations are set honestly from day one. We focus on clear communication, orderly documentation, and respectful customer interactions rather than rushed promises.',
  },
  {
    index: '02',
    title: 'Customer-First Approach',
    body: 'Every customer’s financial context is unique. Our Pune team takes the time to listen, clarify procedural steps, and answer questions patiently before any formal commitment is considered.',
  },
  {
    index: '03',
    title: 'Transparency',
    body: 'We communicate eligibility considerations, required documents, and formal written terms plainly so customers can review every detail with complete clarity.',
  },
  {
    index: '04',
    title: 'Responsible Financial Practices',
    body: 'We operate with adherence to formal review procedures and applicable legal standards in Maharashtra, India, encouraging prudent borrowing aligned with actual requirements.',
  },
  {
    index: '05',
    title: 'Security and Confidentiality',
    body: 'Personal details, enquiry records, and discussions concerning pledged movable assets are handled strictly on a confidential basis with controlled staff access.',
  },
  {
    index: '06',
    title: 'Commitment to Professional Service',
    body: 'From the first enquiry to scheduled office consultations, we strive to uphold consistent standards of courtesy, responsiveness, and institutional discipline.',
  },
];

export function AboutPage() {
  const { settings } = useSite();

  return (
    <>
      <SeoHead
        title="About SG FINANCE | Secured Financial Services in Pune, Maharashtra"
        description="Learn about SG FINANCE in Pune, Maharashtra — our business philosophy, customer-first approach, transparency, security, confidentiality, and responsible financial practices."
        path="/about"
      />

      <section className="bg-[#0A1628] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
              About SG FINANCE
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Financial services grounded in trust, discretion, and accountability.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Serving individuals and businesses in Pune, Maharashtra with secured lending assistance built around clear processes and personal attention.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-20">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
                Who We Are
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0A1628]">
                A dedicated secured lending desk in Pune, Maharashtra.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {settings.aboutIntro}
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Rather than treating enquiries as impersonal transactions, SG FINANCE emphasizes direct human assistance. Customers know who they are speaking with, what steps are involved, and how their information is safeguarded.
              </p>
            </div>
            <div className="lg:col-span-6 min-h-[300px] border border-slate-200 overflow-hidden">
              <SiteImage
                src={ASSETS.aboutLounge}
                alt="SG FINANCE private consultation lounge in Pune"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="mb-12 max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
              Guiding Principles
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#0A1628]">
              The standards that shape every customer interaction.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COMMITMENTS.map((item) => (
              <div
                key={item.index}
                className="border-t border-slate-200 pt-6 space-y-2.5"
              >
                <p className="font-mono text-xs text-[#8C6A24] tabular-nums">
                  {item.index}.
                </p>
                <h3 className="font-display text-xl font-semibold text-[#0A1628]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {/* Core Pillars Summary + CTA */}
          <div className="mt-20 bg-[#F7F8FA] border border-slate-200 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.14em] text-[#8C6A24]">
                Speak With Our Team
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0A1628]">
                Have questions about secured lending or documentation?
              </h2>
              <p className="text-sm text-slate-600">
                {WHY_CHOOSE_PILLARS[1].description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/enquire"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
              >
                Enquire Now
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#0A1628] border border-slate-300 bg-white hover:border-[#0A1628] transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
