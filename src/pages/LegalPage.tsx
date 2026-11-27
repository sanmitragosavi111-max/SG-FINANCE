import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';

export type LegalDocType = 'privacy' | 'terms' | 'disclaimer' | 'loan-terms';

interface LegalPageProps {
  type: LegalDocType;
}

const LEGAL_NAV: { type: LegalDocType; label: string; to: string }[] = [
  { type: 'privacy', label: 'Privacy Policy', to: '/privacy-policy' },
  { type: 'terms', label: 'Terms and Conditions', to: '/terms-and-conditions' },
  { type: 'disclaimer', label: 'Disclaimer', to: '/disclaimer' },
  { type: 'loan-terms', label: 'Loan Terms and Conditions', to: '/loan-terms' },
];

const LEGAL_META: Record<
  LegalDocType,
  {
    path: string;
    pageTitle: string;
    heading: string;
    subtitle: string;
    description: string;
    sections: { title: string; body: string }[];
  }
> = {
  privacy: {
    path: '/privacy-policy',
    pageTitle: 'Privacy Policy | SG FINANCE Pune',
    heading: 'Privacy Policy',
    subtitle: 'How SG FINANCE collects, safeguards, and processes enquiry information.',
    description:
      'Privacy Policy governing customer enquiry data submitted to SG FINANCE in Pune, Maharashtra.',
    sections: [
      {
        title: '1. Information Collected',
        body: 'When you submit an enquiry through this website, we collect only the details you voluntarily provide: your full name, Indian mobile number, optional email address, city, indicative loan requirement, preferred communication channel, optional message, and your explicit consent timestamp.',
      },
      {
        title: '2. Purpose of Collection',
        body: 'Your information is used solely to contact you via your preferred method (phone call or WhatsApp), respond to your enquiry, explain applicable secured lending procedures, and maintain internal enquiry follow-up records.',
      },
      {
        title: '3. Confidentiality and Access Control',
        body: 'Customer enquiry details are stored securely and restricted strictly to authorized SG FINANCE staff via authenticated access controls. Customer details are never published publicly or sold to unrelated third-party marketers.',
      },
      {
        title: '4. Data Retention and Deletion Requests',
        body: 'You may request correction or deletion of your submitted enquiry record at any time by contacting our Pune office via the email address listed on the Contact Us page, subject to statutory record-keeping requirements under applicable Indian laws.',
      },
    ],
  },
  terms: {
    path: '/terms-and-conditions',
    pageTitle: 'Terms and Conditions | SG FINANCE Pune',
    heading: 'Terms and Conditions',
    subtitle: 'General terms governing use of the SG FINANCE public website.',
    description:
      'Terms and Conditions for visitors accessing the SG FINANCE website in Pune, Maharashtra.',
    sections: [
      {
        title: '1. Informational Purpose Only',
        body: 'This website serves solely as a public informational and enquiry portal for SG FINANCE in Pune, Maharashtra. Nothing on this website constitutes a binding offer, sanction letter, financial guarantee, or legal commitment to extend credit.',
      },
      {
        title: '2. Accurate Enquiry Submissions',
        body: 'By submitting an enquiry form, you confirm that the contact information provided belongs to you and is accurate. Automated spam submissions, impersonation, or misuse of the enquiry system are prohibited.',
      },
      {
        title: '3. Third-Party Links',
        body: 'Links to external messaging or social media platforms (such as WhatsApp, Instagram, Facebook, or LinkedIn) are provided for convenience. Interactions on external platforms are subject to those platforms’ respective policies.',
      },
      {
        title: '4. Governing Law and Jurisdiction',
        body: 'Use of this website and any matters arising therefrom shall be governed by applicable laws of India, with subject-matter jurisdiction in Pune, Maharashtra, subject to final legal review.',
      },
    ],
  },
  disclaimer: {
    path: '/disclaimer',
    pageTitle: 'Disclaimer | SG FINANCE Pune',
    heading: 'Disclaimer',
    subtitle: 'Regulatory clarity and legal disclosures for website visitors.',
    description:
      'Legal and regulatory disclaimer for SG FINANCE financial services website in Pune, Maharashtra.',
    sections: [
      {
        title: '1. Institutional Status Clarification',
        body: 'SG FINANCE is not a bank, Non-Banking Financial Company (NBFC), or Reserve Bank of India (RBI)-regulated institution unless and until verified statutory registration particulars are explicitly published following legal verification.',
      },
      {
        title: '2. Statutory Licensing and Compliance',
        body: 'No lending or financial facilitation activity advertised or discussed through this website shall be undertaken except in full compliance with all registrations, licences, and statutory obligations required under applicable Maharashtra and Indian law.',
      },
      {
        title: '3. No Published Rates or Guarantees',
        body: 'This website intentionally refrains from publishing indicative interest rates, loan-to-value (LTV) ratios, processing charges, tenure guarantees, or assured approval timelines. Every enquiry is assessed individually.',
      },
      {
        title: '4. No Guarantee of Approval',
        body: 'Submitting an enquiry form, contacting our team via WhatsApp or telephone, or participating in an initial consultation or asset evaluation does not guarantee loan eligibility or sanction.',
      },
    ],
  },
  'loan-terms': {
    path: '/loan-terms',
    pageTitle: 'Loan Terms and Conditions | SG FINANCE Pune',
    heading: 'Loan Terms and Conditions',
    subtitle: 'General framework governing secured financial facilities, subject to written agreement.',
    description:
      'Framework Loan Terms and Conditions for secured lending enquiries with SG FINANCE in Pune, Maharashtra.',
    sections: [
      {
        title: '1. Written Documentation Governs',
        body: 'All definitive facility terms—including eligible collateral, valuation methodology, sanctioned amount, applicable charges, repayment schedule, redemption procedure, and default remedies—are governed exclusively by signed written documentation executed between the parties.',
      },
      {
        title: '2. Eligibility and Asset Evaluation',
        body: 'Secured lending against pledged movable assets is strictly subject to identity verification (KYC), verification of lawful ownership where applicable, physical asset assessment, internal business policies, and applicable laws in Maharashtra, India.',
      },
      {
        title: '3. Configurable Business Conditions',
        body: 'Service conditions, acceptable collateral categories, and operational policies are configurable by management and may be revised in accordance with applicable statutory requirements without prior website notice.',
      },
      {
        title: '4. Responsible Borrowing',
        body: 'Prospective applicants are encouraged to review all written terms thoroughly and seek clarification from our team before entering into any financial obligation.',
      },
    ],
  },
};

export function LegalPage({ type }: LegalPageProps) {
  const { settings } = useSite();
  const docMeta = LEGAL_META[type];

  const customNote =
    type === 'privacy'
      ? settings.privacyPolicyCustomNote
      : type === 'terms'
        ? settings.termsCustomNote
        : type === 'disclaimer'
          ? settings.disclaimerCustomNote
          : settings.loanTermsCustomNote;

  return (
    <>
      <SeoHead
        title={docMeta.pageTitle}
        description={docMeta.description}
        path={docMeta.path}
      />

      {/* Archival Warm Ivory Header */}
      <section className="bg-[#F7F5F0] border-b border-[#E5DFD3] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-px bg-[#B99752]" aria-hidden="true" />
              <p className="text-xs font-semibold tracking-[0.08em] text-[#B99752]">
                Legal &amp; Governance · SG FINANCE
              </p>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[#0B1628] leading-[1.1]">
              {docMeta.heading}
            </h1>
            <p className="text-base text-[#4B5563] leading-[1.75]">
              {docMeta.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Archival Document Layout */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Document Index */}
            <aside className="lg:col-span-3 lg:sticky lg:top-28 space-y-5">
              <p className="text-xs font-semibold tracking-[0.08em] text-[#747C86]">
                Governance Documents
              </p>
              <nav aria-label="Legal Documents" className="flex flex-col border-t border-[#E5DFD3]">
                {LEGAL_NAV.map((item) => {
                  const active = item.type === type;
                  return (
                    <Link
                      key={item.type}
                      to={item.to}
                      className={`py-3.5 text-sm border-b border-[#E5DFD3] transition-colors ${
                        active
                          ? 'font-semibold text-[#0B1628] underline underline-offset-4 decoration-[#B99752]'
                          : 'text-[#747C86] hover:text-[#0B1628]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="text-sm font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors"
                >
                  Contact SG FINANCE Desk →
                </Link>
              </div>
            </aside>

            {/* Right Document Prose (Optimal 65–72ch Reading Measure) */}
            <article className="lg:col-span-9 max-w-[68ch] space-y-10">
              {customNote.trim() && (
                <div className="bg-[#F7F5F0] border border-[#E5DFD3] p-6 sm:p-7 space-y-2">
                  <p className="text-xs font-semibold tracking-[0.06em] text-[#B99752]">
                    Compliance &amp; Legal Review Note (Editable in Admin Dashboard)
                  </p>
                  <p className="text-sm text-[#202A36] leading-[1.75] whitespace-pre-line">
                    {customNote}
                  </p>
                </div>
              )}

              <div className="divide-y divide-[#E5DFD3] border-t border-b border-[#E5DFD3]">
                {docMeta.sections.map((section) => (
                  <div key={section.title} className="py-8 space-y-3">
                    <h2 className="font-display text-2xl text-[#0B1628] leading-snug">
                      {section.title}
                    </h2>
                    <p className="text-[0.9375rem] sm:text-base text-[#4B5563] leading-[1.8]">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
