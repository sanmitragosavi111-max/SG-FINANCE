import {
  REQUIREMENT_TYPES,
  PREFERRED_CONTACT_METHODS,
} from '../types/site.ts';
import type {
  EnquiryFormInput,
  EnquiryRecord,
  EnquiryStatus,
} from '../types/site.ts';

export const INDIAN_MOBILE_REGEX = /^[6-9][0-9]{9}$/;
export const REFERENCE_CODE_REGEX = /^SGF-[A-Z0-9-]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianMobile(raw: string): boolean {
  const normalized = normalizeIndianMobile(raw);
  return INDIAN_MOBILE_REGEX.test(normalized);
}

export interface EnquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof EnquiryFormInput, string>>;
  sanitized: {
    fullName: string;
    mobileNumber: string;
    email: string;
    city: string;
    requiredAmount: string;
    requirementType: string;
    preferredContact: string;
    message: string;
    consentAccepted: boolean;
  };
}

export function validateEnquiryInput(input: EnquiryFormInput): EnquiryValidationResult {
  const errors: Partial<Record<keyof EnquiryFormInput, string>> = {};

  const fullName = input.fullName.trim().slice(0, 100);
  const mobileNumber = normalizeIndianMobile(input.mobileNumber);
  const email = (input.email ?? '').trim().slice(0, 120);
  const city = input.city.trim().slice(0, 80);
  const requiredAmount = input.requiredAmount.trim().slice(0, 40);
  const requirementType = input.requirementType.trim();
  const preferredContact = input.preferredContact.trim();
  const message = input.message.trim().slice(0, 1000);
  const consentAccepted = input.consentAccepted === true;

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  if (!INDIAN_MOBILE_REGEX.test(mobileNumber)) {
    errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
  }

  if (email.length > 0 && !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address or leave this field blank.';
  }

  if (city.length < 2) {
    errors.city = 'Please enter your city (for example, Pune).';
  }

  if (requiredAmount.length < 1) {
    errors.requiredAmount = 'Please indicate your required loan amount.';
  }

  if (!(REQUIREMENT_TYPES as readonly string[]).includes(requirementType)) {
    errors.requirementType = 'Please select the type of financial requirement.';
  }

  if (!(PREFERRED_CONTACT_METHODS as readonly string[]).includes(preferredContact)) {
    errors.preferredContact = 'Please choose your preferred contact method.';
  }

  if (input.message.trim().length > 1000) {
    errors.message = 'Additional message must be 1,000 characters or fewer.';
  }

  if (!consentAccepted) {
    errors.consentAccepted =
      'Please provide your consent to be contacted and have your enquiry processed under the Privacy Policy.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      fullName,
      mobileNumber,
      email,
      city,
      requiredAmount,
      requirementType,
      preferredContact,
      message,
      consentAccepted,
    },
  };
}

export function generateReferenceCode(now: Date = new Date()): string {
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
  return `SGF-${year}${month}${day}-${randomPart}`;
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message.trim());
  if (digits.length >= 10) {
    const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${withCountryCode}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function sanitizeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export interface EnquiryFilterCriteria {
  search: string;
  status: 'all' | EnquiryStatus;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
}

export function filterEnquiries(
  items: EnquiryRecord[],
  criteria: EnquiryFilterCriteria
): EnquiryRecord[] {
  const q = criteria.search.trim().toLowerCase();
  const fromTime = criteria.dateFrom ? new Date(`${criteria.dateFrom}T00:00:00`).getTime() : null;
  const toTime = criteria.dateTo ? new Date(`${criteria.dateTo}T23:59:59.999`).getTime() : null;

  return items.filter((item) => {
    if (criteria.status !== 'all' && item.status !== criteria.status) {
      return false;
    }

    if (fromTime !== null || toTime !== null) {
      const createdMs = item.createdAt ? item.createdAt.getTime() : null;
      if (createdMs === null) return false;
      if (fromTime !== null && createdMs < fromTime) return false;
      if (toTime !== null && createdMs > toTime) return false;
    }

    if (q) {
      const haystack = [
        item.referenceCode,
        item.fullName,
        item.mobileNumber,
        item.email,
        item.city,
        item.requiredAmount,
        item.requirementType,
        item.message,
        item.remarks,
        item.source,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }

    return true;
  });
}
