import type { SiteSettings } from '../types/site.ts';
import { formatIndianPhoneDisplay, OFFICIAL_CONTACT } from './contact.ts';

export const ASSETS = {
  heroEditorial: '/src/assets/images/hero_editorial_consultation_1795699112721.jpg',
  servicesEvaluation: '/src/assets/images/editorial_asset_evaluation_1795699115034.jpg',
  aboutSanctuary: '/src/assets/images/editorial_pune_sanctuary_1795699119127.jpg',
  processConsultation: '/src/assets/images/editorial_consultation_meeting_1795699116800.jpg',
  ogShareCard: '/src/assets/images/og_sg_finance_share_1795591709430.jpg',
} as const;

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const DEFAULT_WHATSAPP_MESSAGE = OFFICIAL_CONTACT.whatsappPrefillMessage;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phoneDisplay: formatIndianPhoneDisplay(env.VITE_CONTACT_PHONE?.trim() || OFFICIAL_CONTACT.phoneDisplay),
  phoneHref: env.VITE_CONTACT_PHONE?.replace(/[^\d+]/g, '') || OFFICIAL_CONTACT.phoneHref,
  whatsappNumber: env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') || OFFICIAL_CONTACT.whatsappNumber,
  whatsappPrefillMessage: OFFICIAL_CONTACT.whatsappPrefillMessage,
  email: env.VITE_CONTACT_EMAIL?.trim() || OFFICIAL_CONTACT.email,
  addressLine: 'Office Visit by Appointment',
  cityRegion: OFFICIAL_CONTACT.cityRegion,
  workingHours: 'Monday to Saturday · By Appointment',
  mapsEmbedUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  heroHeadline: 'Financial Clarity. Built on Trust.',
  heroSubtitle:
    'Thoughtful secured financial solutions, guided by transparency, confidentiality and a professional approach.',
  aboutIntro:
    'SG FINANCE is a Pune-based financial services firm focused on secured lending and loans against eligible pledged movable assets. Every enquiry is handled with clear communication, confidentiality, and responsible financial practices.',
  complianceBannerNote:
    'All financial enquiries and facilities are subject to eligibility assessment, asset evaluation where applicable, documentation review, applicable laws in Maharashtra, India, and internal business approvals. Submitting an enquiry does not constitute loan approval.',
  privacyPolicyCustomNote:
    'Compliance Review Placeholder: Before public launch, insert the verified Legal Entity Name, Grievance Officer contact details, and registered office address in Pune, Maharashtra.',
  termsCustomNote:
    'Compliance Review Placeholder: Before public launch, confirm business registration particulars and jurisdiction clauses with qualified legal counsel in Maharashtra, India.',
  disclaimerCustomNote:
    'Compliance Review Placeholder: Verify that all applicable local registrations and statutory licences required under Maharashtra law are active prior to advertising or extending lending facilities.',
  loanTermsCustomNote:
    'Compliance Review Placeholder: Actual facility terms, collateral eligibility criteria, valuation methodology, charges, and repayment schedules are communicated exclusively in written sanctioned documentation and are never implied by website content.',
  googleAnalyticsId: env.VITE_GOOGLE_ANALYTICS_ID?.trim() || '',
  googleSiteVerification: env.VITE_GOOGLE_SITE_VERIFICATION?.trim() || '',
};

export interface ServiceDefinition {
  index: string;
  id: string;
  title: string;
  summary: string;
  details: string;
  keyPoints: string[];
}

export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    index: '01',
    id: 'secured-lending',
    title: 'Secured Lending Solutions',
    summary:
      'Structured secured financial assistance backed by eligible movable assets, designed around clear documentation and transparent communication.',
    details:
      'We work with individuals and business owners in Pune and surrounding areas of Maharashtra who seek structured secured liquidity without ambiguity. Every discussion begins with understanding your requirement and explaining the applicable process clearly.',
    keyPoints: [
      'Structured consultation tailored to your stated requirement',
      'Clear explanation of documentation and procedural steps',
      'Subject to eligibility verification, applicable laws, and internal approvals',
    ],
  },
  {
    index: '02',
    id: 'pledged-assets',
    title: 'Loan Against Eligible Pledged Assets',
    summary:
      'Dedicated assistance for secured borrowing against eligible pledged movable assets, supported by transparent physical evaluation where applicable.',
    details:
      'Eligible movable assets are reviewed through an orderly assessment process so customers understand how valuation and documentation are conducted before proceeding further. Terms are finalized solely through formal written documentation.',
    keyPoints: [
      'Confidential asset review conducted in a secure office setting',
      'Written record of asset details and applicable conditions',
      'Asset eligibility and facility parameters remain subject to business policy and law',
    ],
  },
  {
    index: '03',
    id: 'short-term-assistance',
    title: 'Short-Term Financial Assistance',
    summary:
      'Practical short-term secured financial options structured to address immediate personal or working-capital liquidity needs responsibly.',
    details:
      'Whether bridging a scheduled business obligation or handling a time-sensitive requirement, our team outlines feasible secured options clearly so you can make an informed decision with full visibility into your commitments.',
    keyPoints: [
      'Direct communication with the SG FINANCE team in Pune',
      'No hidden commitments prior to formal review and written agreement',
      'All tenures, charges, and approvals remain subject to formal sanction',
    ],
  },
  {
    index: '04',
    id: 'customer-consultation',
    title: 'Customer Consultation and Assistance',
    summary:
      'One-to-one financial consultation to help you understand eligibility considerations, documentation requirements, and next steps before applying.',
    details:
      'Not sure how secured lending works or what documents may be needed? Submit an enquiry or speak with our team to receive straightforward answers before making any formal application decision.',
    keyPoints: [
      'Dedicated guidance via phone, WhatsApp, or scheduled office visit',
      'Respectful, private handling of personal and financial information',
      'Zero obligation attached to an initial consultation or enquiry',
    ],
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  summary: string;
  detail: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Submit Your Enquiry',
    summary:
      'Share your basic contact details and financial requirement through our secure online enquiry form or via WhatsApp.',
    detail:
      'Provide your name, Indian mobile number, city, indicative requirement, and preferred method of contact. You will receive an immediate enquiry reference number.',
  },
  {
    number: '02',
    title: 'Discuss Your Financial Requirements',
    summary:
      'An authorized SG FINANCE representative contacts you via your preferred channel to understand your needs.',
    detail:
      'We clarify your requirement, explain our general secured lending procedure, and outline any documentation that may be requested for further evaluation.',
  },
  {
    number: '03',
    title: 'Asset Evaluation and Documentation, Where Applicable',
    summary:
      'Eligible movable assets and supporting KYC documents are reviewed transparently in accordance with business procedures.',
    detail:
      'Where a secured facility involves pledged movable assets, evaluation and verification are carried out systematically with clear communication at every stage.',
  },
  {
    number: '04',
    title: 'Application Review and Decision',
    summary:
      'Your formal request undergoes internal review, and the outcome along with applicable terms is communicated clearly.',
    detail:
      'Submitting an enquiry or completing an evaluation does not guarantee loan approval. All decisions remain subject to internal credit/business approval and applicable laws.',
  },
];

export interface PhilosophyPillar {
  index: string;
  title: string;
  description: string;
}

export const WHY_CHOOSE_PILLARS: PhilosophyPillar[] = [
  {
    index: '01',
    title: 'Transparent Process',
    description:
      'Every stage from initial enquiry to documentation review is explained in plain, straightforward language without ambiguity or unstated conditions.',
  },
  {
    index: '02',
    title: 'Personalised Assistance',
    description:
      'Direct one-to-one support from our Pune team by telephone, WhatsApp, or scheduled appointment so every question is addressed thoughtfully.',
  },
  {
    index: '03',
    title: 'Confidential Consultation',
    description:
      'Customer enquiry records, financial discussions, and asset evaluations are handled privately with restricted, authorized staff access.',
  },
  {
    index: '04',
    title: 'Responsible Financial Practices',
    description:
      'We encourage informed financial decisions grounded in clear written documentation, formal review, and adherence to applicable laws in Maharashtra.',
  },
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'what-is-secured-loan',
    question: 'What is a secured loan?',
    answer:
      'A secured loan is a financial facility supported by eligible collateral, such as pledged movable assets. Because the facility is backed by an asset, the evaluation process considers both the applicant’s documentation and the assessed value and eligibility of the pledged asset, subject to applicable business policies and laws.',
  },
  {
    id: 'how-enquiry-works',
    question: 'How does the enquiry process work?',
    answer:
      'You begin by submitting your name, mobile number, city, and indicative financial requirement through our enquiry form or contacting us via WhatsApp or phone. Our team reviews your enquiry, reaches out via your preferred channel to discuss your requirement, and guides you through any subsequent documentation or evaluation steps.',
  },
  {
    id: 'documents-required',
    question: 'What documents may be required?',
    answer:
      'Standard identity verification (KYC), address proof, and relevant ownership or supporting documents for the asset being pledged may be requested depending on the nature of the requirement. Exact documentation needs are communicated clearly during your consultation.',
  },
  {
    id: 'asset-evaluation',
    question: 'How is a pledged asset evaluated?',
    answer:
      'Where applicable, eligible movable assets are examined through a structured physical inspection and verification procedure at our office or designated consultation setting. The evaluation criteria and resulting terms are explained transparently before you decide whether to proceed.',
  },
  {
    id: 'loan-eligibility',
    question: 'How is loan eligibility determined?',
    answer:
      'Eligibility is assessed on a case-by-case basis considering KYC verification, asset eligibility and evaluation where applicable, internal business policies, and compliance with applicable laws in Maharashtra, India. Submitting an enquiry does not automatically guarantee eligibility or approval.',
  },
  {
    id: 'after-enquiry',
    question: 'What happens after submitting an enquiry?',
    answer:
      'Your enquiry is securely recorded in our system and assigned a unique reference code. An authorized SG FINANCE team member will contact you using your preferred communication method during working hours to discuss your requirement and outline the next steps.',
  },
  {
    id: 'how-to-contact',
    question: 'How can I contact SG FINANCE?',
    answer:
      'You can reach SG FINANCE by submitting the online Enquire Now form, messaging us via the WhatsApp button available on every page, calling our office number (+91 7038391002), or writing to in.sg.infra@gmail.com.',
  },
];
