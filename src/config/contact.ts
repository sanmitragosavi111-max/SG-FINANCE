/**
 * Central SG FINANCE Contact Configuration
 * Update phone, WhatsApp, or business email here to update defaults across the entire website.
 */
export const OFFICIAL_CONTACT = {
  phoneDisplay: '+91 7038391002',
  phoneHref: '+917038391002',
  whatsappDisplay: '+91 7038391002',
  whatsappNumber: '917038391002',
  whatsappPrefillMessage:
    'Hello SG FINANCE, I would like to enquire about your financial services. Please contact me.',
  email: 'in.sg.infra@gmail.com',
  emailSubject: 'SG FINANCE Customer Enquiry',
  cityRegion: 'Pune, Maharashtra, India',
} as const;

export function formatIndianPhoneDisplay(raw: string = OFFICIAL_CONTACT.phoneDisplay): string {
  const trimmed = raw.trim();
  if (!trimmed) return OFFICIAL_CONTACT.phoneDisplay;
  const digits = trimmed.replace(/\D/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91 ${digits}`;
  }
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+91 ${digits.slice(2)}`;
  }
  return trimmed;
}

export function getTelHref(phoneHref: string = OFFICIAL_CONTACT.phoneHref): string {
  const cleaned = phoneHref.replace(/[^\d+]/g, '');
  if (!cleaned) {
    return `tel:${OFFICIAL_CONTACT.phoneHref}`;
  }
  const digits = cleaned.replace(/\D/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `tel:+91${digits}`;
  }
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `tel:+${digits}`;
  }
  return `tel:${cleaned}`;
}

export function getMailtoHref(
  email: string = OFFICIAL_CONTACT.email,
  subject: string = OFFICIAL_CONTACT.emailSubject
): string {
  const cleanEmail = email.trim() || OFFICIAL_CONTACT.email;
  const encodedSubject = encodeURIComponent(subject.trim() || OFFICIAL_CONTACT.emailSubject);
  return `mailto:${cleanEmail}?subject=${encodedSubject}`;
}
