export const REQUIREMENT_TYPES = [
  'Secured Lending Solutions',
  'Loan Against Eligible Pledged Assets',
  'Short-Term Financial Assistance',
  'Customer Consultation and Assistance',
] as const;

export type EnquiryRequirementType = (typeof REQUIREMENT_TYPES)[number];

export const PREFERRED_CONTACT_METHODS = [
  'Phone Call',
  'WhatsApp',
  'Either',
] as const;

export type PreferredContactMethod = (typeof PREFERRED_CONTACT_METHODS)[number];

export const ENQUIRY_STATUSES = [
  'new',
  'contacted',
  'in_review',
  'follow_up',
  'closed',
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface EnquiryFormInput {
  fullName: string;
  mobileNumber: string;
  email: string;
  city: string;
  requiredAmount: string;
  requirementType: string;
  preferredContact: string;
  message: string;
  consentAccepted: boolean;
}

export const EMAIL_NOTIFICATION_STATUSES = [
  'pending',
  'sent',
  'failed',
] as const;

export type EmailNotificationStatus = (typeof EMAIL_NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_RETRY_STATUSES = [
  'none',
  'retrying',
  'retried_sent',
  'retried_failed',
] as const;

export type NotificationRetryStatus = (typeof NOTIFICATION_RETRY_STATUSES)[number];

export interface EnquiryRecord {
  id: string;
  referenceCode: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  city: string;
  requiredAmount: string;
  requirementType: EnquiryRequirementType;
  preferredContact: PreferredContactMethod;
  message: string;
  consentAccepted: boolean;
  status: EnquiryStatus;
  remarks: string;
  source: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  emailNotificationStatus?: EmailNotificationStatus;
  emailNotificationError?: string;
  emailNotificationAttempts?: number;
  emailNotificationRetryStatus?: NotificationRetryStatus;
  emailNotifiedAt?: string;
}

export interface SiteSettings {
  phoneDisplay: string;
  phoneHref: string;
  whatsappNumber: string;
  whatsappPrefillMessage: string;
  email: string;
  addressLine: string;
  cityRegion: string;
  workingHours: string;
  mapsEmbedUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  heroHeadline: string;
  heroSubtitle: string;
  aboutIntro: string;
  complianceBannerNote: string;
  privacyPolicyCustomNote: string;
  termsCustomNote: string;
  disclaimerCustomNote: string;
  loanTermsCustomNote: string;
  googleAnalyticsId: string;
  googleSiteVerification: string;
}

export interface AdminProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
  createdAt: Date | null;
}
