import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';

export type LegalDocType = 'privacy' | 'terms' | 'disclaimer' | 'loan-terms';

interface LegalPageProps {
  type: LegalDocType;
}

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
        body: 'When you submit an enquiry through this website, we collect only the details you voluntarily provide: your full name, Indian mobile number, city, indicative loan requirement, preferred communication channel, optional message, and your explicit consent timestamp.',
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

      <section className="bg-[#0A1628] text-white py-14 sm:py-18 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#D4AF5A]">
            Legal &amp; Compliance · SG FINANCE
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold">
            {docMeta.heading}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {docMeta.subtitle}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
          {customNote.trim() && (
            <div className="bg-[#F7F8FA] border border-slate-200 p-6 space-y-2">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#8C6A24]">
                Compliance &amp; Legal Review Note (Editable in Admin Dashboard)
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {customNote}
              </p>
            </div>
          )}

          <div className="space-y-8">
            {docMeta.sections.map((section) => (
              <div key={section.title} className="space-y-2.5 border-b border-slate-200 pb-7">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#0A1628]">
                  {section.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap gap-4 text-slate-600">
              <Link to="/privacy-policy" className="hover:text-[#0A1628] underline underline-offset-2">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="hover:text-[#0A1628] underline underline-offset-2">
                Terms &amp; Conditions
              </Link>
              <Link to="/disclaimer" className="hover:text-[#0A1628] underline underline-offset-2">
                Disclaimer
              </Link>
              <Link to="/loan-terms" className="hover:text-[#0A1628] underline underline-offset-2">
                Loan Terms
              </Link>
            </div>
            <Link
              to="/contact"
              className="font-semibold text-[#0A1628] hover:text-[#8C6A24] transition-colors"
            >
              Contact SG FINANCE
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
