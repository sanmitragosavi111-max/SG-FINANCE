import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, AlertCircle, ArrowRight, Phone } from 'lucide-react';
import {
  PREFERRED_CONTACT_METHODS,
  REQUIREMENT_TYPES,
} from '../types/site';
import type { EnquiryFormInput } from '../types/site';
import { submitEnquiry } from '../services/firestoreService';
import { useSite } from '../context/SiteContext';
import { OFFICIAL_CONTACT, getTelHref } from '../config/contact';
import { buildEnquiryWhatsAppUrl } from '../utils/enquiryNotifications';
import type { EnquiryNotificationPayload } from '../utils/enquiryNotifications';

interface EnquiryFormProps {
  source: string;
  compact?: boolean;
  defaultRequirement?: string;
}

const INITIAL_FORM: EnquiryFormInput = {
  fullName: '',
  mobileNumber: '',
  email: '',
  city: 'Pune',
  requiredAmount: '',
  requirementType: REQUIREMENT_TYPES[0],
  preferredContact: PREFERRED_CONTACT_METHODS[0],
  message: '',
  consentAccepted: false,
};

export function EnquiryForm({
  source,
  compact = false,
  defaultRequirement,
}: EnquiryFormProps) {
  const { settings } = useSite();
  const [form, setForm] = useState<EnquiryFormInput>({
    ...INITIAL_FORM,
    requirementType: defaultRequirement || REQUIREMENT_TYPES[0],
  });
  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EnquiryFormInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<EnquiryNotificationPayload | null>(null);

  function updateField<K extends keyof EnquiryFormInput>(
    key: K,
    value: EnquiryFormInput[K]
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (formError) setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const outcome = await submitEnquiry(form, source, honeypot);
      if (!outcome.ok) {
        if (outcome.fieldErrors) {
          setFieldErrors(outcome.fieldErrors);
        }
        setFormError(
          outcome.errorMessage || 'Please check the form fields and try again.'
        );
        return;
      }

      setSubmittedDetails(
        outcome.submittedPayload ?? {
          enquiryId: outcome.enquiryId || outcome.referenceCode || 'SGF-RECEIVED',
          referenceCode: outcome.referenceCode || 'SGF-RECEIVED',
          fullName: form.fullName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          email: form.email.trim(),
          requirementType: form.requirementType,
          requiredAmount: form.requiredAmount.trim(),
          city: form.city.trim(),
          preferredContact: form.preferredContact,
          message: form.message.trim(),
          source,
          submittedAtIso: new Date().toISOString(),
        }
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedDetails) {
    const whatsappFollowUp = buildEnquiryWhatsAppUrl(
      settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
      submittedDetails
    );
    const callHref = getTelHref(settings.phoneHref || OFFICIAL_CONTACT.phoneHref);

    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-white border border-[#E5DFD3] p-7 sm:p-10"
      >
        <div className="flex items-start gap-4">
          <CheckCircle2
            className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-5 flex-1">
            <div>
              <p className="text-xs font-semibold text-[#B99752] tracking-wide mb-1.5">
                Enquiry Recorded
              </p>
              <h3 className="font-display text-2xl sm:text-3xl text-[#0B1628]">
                Thank you for contacting SG FINANCE.
              </h3>
            </div>
            <p className="text-sm sm:text-[0.9375rem] text-[#4B5563] leading-relaxed">
              Your enquiry has been securely recorded for review by the SG FINANCE team. An authorized representative will reach out via your preferred contact method during working hours. You may also send your pre-filled enquiry summary directly on WhatsApp or call our office below. Please note that submitting an enquiry does not constitute loan approval.
            </p>
            <div className="bg-[#F7F5F0] border border-[#E5DFD3] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#747C86]">Enquiry ID</span>
              <span className="font-mono text-sm font-medium text-[#0B1628] tabular-nums">
                {submittedDetails.referenceCode}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={whatsappFollowUp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                Send Enquiry on WhatsApp
              </a>
              <a
                href={callHref}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                Call Us
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedDetails(null);
                  setForm({
                    ...INITIAL_FORM,
                    requirementType: defaultRequirement || REQUIREMENT_TYPES[0],
                  });
                }}
                className="px-4 py-3 text-sm font-medium text-[#202A36] border border-[#E5DFD3] hover:border-[#0B1628] transition-colors cursor-pointer whitespace-nowrap"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputBase =
    'w-full px-4 py-3 text-sm text-[#202A36] bg-[#FCFBF9] border outline-none transition-colors duration-150 placeholder:text-[#9CA3AF]';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`bg-white border border-[#E5DFD3] ${compact ? 'p-6 sm:p-8' : 'p-6 sm:p-10'}`}
    >
      {/* Hidden anti-spam honeypot field */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`website-${source}`}>Company Website</label>
        <input
          id={`website-${source}`}
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 p-4 bg-red-50/90 border border-red-200 text-red-900 text-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor={`fullName-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            Full Name <span className="text-red-700">*</span>
          </label>
          <input
            id={`fullName-${source}`}
            name="fullName"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            aria-invalid={Boolean(fieldErrors.fullName)}
            className={`${inputBase} ${
              fieldErrors.fullName
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          />
          {fieldErrors.fullName && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`mobileNumber-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            Mobile Number (India) <span className="text-red-700">*</span>
          </label>
          <input
            id={`mobileNumber-${source}`}
            name="mobileNumber"
            type="tel"
            inputMode="numeric"
            required
            maxLength={16}
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={form.mobileNumber}
            onChange={(e) => updateField('mobileNumber', e.target.value)}
            aria-invalid={Boolean(fieldErrors.mobileNumber)}
            className={`${inputBase} tabular-nums ${
              fieldErrors.mobileNumber
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          />
          {fieldErrors.mobileNumber && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.mobileNumber}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`email-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            Email Address <span className="text-[#747C86] font-normal">(Optional)</span>
          </label>
          <input
            id={`email-${source}`}
            name="email"
            type="email"
            maxLength={120}
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className={`${inputBase} ${
              fieldErrors.email
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`city-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            City <span className="text-red-700">*</span>
          </label>
          <input
            id={`city-${source}`}
            name="city"
            type="text"
            required
            maxLength={80}
            autoComplete="address-level2"
            placeholder="e.g., Pune"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            aria-invalid={Boolean(fieldErrors.city)}
            className={`${inputBase} ${
              fieldErrors.city
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          />
          {fieldErrors.city && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.city}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`requiredAmount-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            Required Loan Amount <span className="text-red-700">*</span>
          </label>
          <input
            id={`requiredAmount-${source}`}
            name="requiredAmount"
            type="text"
            required
            maxLength={40}
            placeholder="e.g., ₹2,00,000"
            value={form.requiredAmount}
            onChange={(e) => updateField('requiredAmount', e.target.value)}
            aria-invalid={Boolean(fieldErrors.requiredAmount)}
            className={`${inputBase} tabular-nums ${
              fieldErrors.requiredAmount
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          />
          {fieldErrors.requiredAmount && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.requiredAmount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`requirementType-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            Type of Financial Requirement <span className="text-red-700">*</span>
          </label>
          <select
            id={`requirementType-${source}`}
            name="requirementType"
            required
            value={form.requirementType}
            onChange={(e) => updateField('requirementType', e.target.value)}
            aria-invalid={Boolean(fieldErrors.requirementType)}
            className={`${inputBase} ${
              fieldErrors.requirementType
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          >
            {REQUIREMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldErrors.requirementType && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.requirementType}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor={`preferredContact-${source}`}
            className="block text-sm font-medium text-[#202A36] mb-1.5"
          >
            Preferred Contact Method <span className="text-red-700">*</span>
          </label>
          <select
            id={`preferredContact-${source}`}
            name="preferredContact"
            required
            value={form.preferredContact}
            onChange={(e) => updateField('preferredContact', e.target.value)}
            aria-invalid={Boolean(fieldErrors.preferredContact)}
            className={`${inputBase} ${
              fieldErrors.preferredContact
                ? 'border-red-500'
                : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
            }`}
          >
            {PREFERRED_CONTACT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          {fieldErrors.preferredContact && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.preferredContact}</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor={`message-${source}`}
          className="block text-sm font-medium text-[#202A36] mb-1.5"
        >
          Additional Message
        </label>
        <textarea
          id={`message-${source}`}
          name="message"
          rows={compact ? 3 : 4}
          maxLength={1000}
          placeholder="Briefly describe your financial requirement or preferred call time (optional)"
          value={form.message}
          onChange={(e) => updateField('message', e.target.value)}
          aria-invalid={Boolean(fieldErrors.message)}
          className={`${inputBase} resize-y ${
            fieldErrors.message
              ? 'border-red-500'
              : 'border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white'
          }`}
        />
        {fieldErrors.message && (
          <p className="mt-1.5 text-xs text-red-700">{fieldErrors.message}</p>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-[#F0ECE4]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consentAccepted"
            checked={form.consentAccepted}
            onChange={(e) => updateField('consentAccepted', e.target.checked)}
            aria-invalid={Boolean(fieldErrors.consentAccepted)}
            className="mt-1 w-4 h-4 accent-[#0B1628] shrink-0 cursor-pointer"
          />
          <span className="text-xs text-[#747C86] leading-relaxed">
            I authorize SG FINANCE to contact me via phone or WhatsApp regarding this enquiry and consent to the processing of my submitted details in accordance with the{' '}
            <Link
              to="/privacy-policy"
              className="text-[#0B1628] underline underline-offset-2 hover:text-[#B99752]"
            >
              Privacy Policy
            </Link>
            . I understand that submitting an enquiry does not guarantee loan approval.
          </span>
        </label>
        {fieldErrors.consentAccepted && (
          <p className="mt-1.5 text-xs text-red-700">{fieldErrors.consentAccepted}</p>
        )}
      </div>

      <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
        >
          {submitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}
          {!submitting && <ArrowRight className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />}
        </button>
        <p className="text-xs text-[#747C86]">
          Confidential handling · Subject to evaluation &amp; applicable laws
        </p>
      </div>
    </form>
  );
}
