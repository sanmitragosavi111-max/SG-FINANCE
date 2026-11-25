import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import {
  PREFERRED_CONTACT_METHODS,
  REQUIREMENT_TYPES,
} from '../types/site';
import type { EnquiryFormInput } from '../types/site';
import { submitEnquiry } from '../services/firestoreService';
import { useSite } from '../context/SiteContext';
import { OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl } from '../utils/validation';

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
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

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

      setSubmittedRef(outcome.referenceCode || 'SGF-RECEIVED');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedRef) {
    const whatsappFollowUp = buildWhatsAppUrl(
      settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
      `Hello SG FINANCE, I just submitted an enquiry (Reference: ${submittedRef}). Please contact me.`
    );

    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-white border border-slate-200 p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <CheckCircle2
            className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[#8C6A24] tracking-wide mb-1">
                Enquiry Saved
              </p>
              <h3 className="font-display text-2xl font-semibold text-[#0A1628]">
                Thank you for contacting SG FINANCE.
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your enquiry has been securely saved to our enquiry database for review by the SG FINANCE team. An authorized representative will reach out via your preferred contact method during working hours. You can also continue the conversation immediately on WhatsApp below. Please note that submitting an enquiry does not constitute loan approval.
            </p>
            <div className="bg-[#F7F8FA] border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-600">Reference Number</span>
              <span className="font-mono text-sm font-medium text-[#0A1628] tabular-nums">
                {submittedRef}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={whatsappFollowUp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                Continue on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedRef(null);
                  setForm({
                    ...INITIAL_FORM,
                    requirementType: defaultRequirement || REQUIREMENT_TYPES[0],
                  });
                }}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 hover:border-slate-500 transition-colors cursor-pointer whitespace-nowrap"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`bg-white border border-slate-200 ${compact ? 'p-6 sm:p-7' : 'p-6 sm:p-9'}`}
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
          className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-900 text-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor={`fullName-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border ${
              fieldErrors.fullName ? 'border-red-500' : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
          />
          {fieldErrors.fullName && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`mobileNumber-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border tabular-nums ${
              fieldErrors.mobileNumber
                ? 'border-red-500'
                : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
          />
          {fieldErrors.mobileNumber && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.mobileNumber}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`email-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            Email Address <span className="text-slate-400 font-normal">(Optional)</span>
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border ${
              fieldErrors.email ? 'border-red-500' : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`city-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border ${
              fieldErrors.city ? 'border-red-500' : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
          />
          {fieldErrors.city && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.city}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`requiredAmount-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border tabular-nums ${
              fieldErrors.requiredAmount
                ? 'border-red-500'
                : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
          />
          {fieldErrors.requiredAmount && (
            <p className="mt-1.5 text-xs text-red-700">{fieldErrors.requiredAmount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor={`requirementType-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border ${
              fieldErrors.requirementType
                ? 'border-red-500'
                : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
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

        <div>
          <label
            htmlFor={`preferredContact-${source}`}
            className="block text-sm font-medium text-slate-800 mb-1.5"
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
            className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border ${
              fieldErrors.preferredContact
                ? 'border-red-500'
                : 'border-slate-300 focus:border-[#0A1628]'
            } outline-none transition-colors`}
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
          className="block text-sm font-medium text-slate-800 mb-1.5"
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
          className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border ${
            fieldErrors.message ? 'border-red-500' : 'border-slate-300 focus:border-[#0A1628]'
          } outline-none transition-colors resize-y`}
        />
        {fieldErrors.message && (
          <p className="mt-1.5 text-xs text-red-700">{fieldErrors.message}</p>
        )}
      </div>

      <div className="mt-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consentAccepted"
            checked={form.consentAccepted}
            onChange={(e) => updateField('consentAccepted', e.target.checked)}
            aria-invalid={Boolean(fieldErrors.consentAccepted)}
            className="mt-1 w-4 h-4 accent-[#0A1628] shrink-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I authorize SG FINANCE to contact me via phone or WhatsApp regarding this enquiry and consent to the processing of my submitted details in accordance with the{' '}
            <Link
              to="/privacy-policy"
              className="text-[#0A1628] underline underline-offset-2 hover:text-[#8C6A24]"
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

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-7 py-3 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
        >
          {submitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}
        </button>
        <p className="text-xs text-slate-500">
          Confidential handling · Subject to evaluation &amp; applicable laws
        </p>
      </div>
    </form>
  );
}
