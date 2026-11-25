import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DEFAULT_SITE_SETTINGS } from '../config/defaults';
import {
  generateReferenceCode,
  validateEnquiryInput,
} from '../utils/validation';
import type {
  EnquiryFormInput,
  EnquiryRecord,
  EnquiryStatus,
  SiteSettings,
} from '../types/site';

const SETTINGS_PATH = 'site_settings/public';
const ENQUIRIES_COLLECTION = 'enquiries';

// Local in-memory duplicate cooldown backup (in case static hosting skips Express)
const recentMobileSubmissions = new Map<string, number>();

export interface EnquirySubmissionOutcome {
  ok: boolean;
  referenceCode?: string;
  errorMessage?: string;
  fieldErrors?: Partial<Record<keyof EnquiryFormInput, string>>;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return null;
}

export async function submitEnquiry(
  input: EnquiryFormInput,
  source: string,
  honeypotValue = ''
): Promise<EnquirySubmissionOutcome> {
  // Honeypot guard
  if (honeypotValue.trim().length > 0) {
    return {
      ok: false,
      errorMessage: 'Unable to process this enquiry. Please contact our office directly.',
    };
  }

  const localValidation = validateEnquiryInput(input);
  if (!localValidation.valid) {
    return {
      ok: false,
      errorMessage: 'Please review the highlighted fields below.',
      fieldErrors: localValidation.errors,
    };
  }

  const normalizedMobile = localValidation.sanitized.mobileNumber;
  const now = Date.now();
  const localCooldownUntil = recentMobileSubmissions.get(normalizedMobile);
  if (localCooldownUntil && localCooldownUntil > now) {
    const secs = Math.ceil((localCooldownUntil - now) / 1000);
    return {
      ok: false,
      errorMessage: `An enquiry for this mobile number was just submitted. Please wait ${secs} seconds before submitting again.`,
    };
  }

  // Server-side anti-spam & rate-limit validation gate
  let referenceCode = generateReferenceCode();
  try {
    const res = await fetch('/api/enquiries/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...localValidation.sanitized,
        companyWebsite: honeypotValue,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = (await res.json()) as {
        ok?: boolean;
        referenceCode?: string;
        message?: string;
        errors?: Partial<Record<keyof EnquiryFormInput, string>>;
      };

      if (!res.ok || !payload.ok) {
        return {
          ok: false,
          errorMessage: payload.message || 'Unable to submit enquiry right now. Please try again.',
          fieldErrors: payload.errors,
        };
      }
      if (payload.referenceCode) {
        referenceCode = payload.referenceCode;
      }
    }
  } catch {
    // If Express validation endpoint is unreachable in a static preview, Firestore rules still enforce full schema integrity.
  }

  const cleanId = `enq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const docPath = `${ENQUIRIES_COLLECTION}/${cleanId}`;

  try {
    await setDoc(doc(db, ENQUIRIES_COLLECTION, cleanId), {
      referenceCode,
      fullName: localValidation.sanitized.fullName,
      mobileNumber: localValidation.sanitized.mobileNumber,
      email: localValidation.sanitized.email,
      city: localValidation.sanitized.city,
      requiredAmount: localValidation.sanitized.requiredAmount,
      requirementType: localValidation.sanitized.requirementType,
      preferredContact: localValidation.sanitized.preferredContact,
      message: localValidation.sanitized.message,
      consentAccepted: true,
      status: 'new',
      remarks: '',
      source: source.trim().slice(0, 60) || 'website',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    recentMobileSubmissions.set(normalizedMobile, Date.now() + 90_000);
    return { ok: true, referenceCode };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    } catch {
      return {
        ok: false,
        errorMessage:
          'We could not save your enquiry right now. Please try again or reach us directly via WhatsApp.',
      };
    }
  }
}

export async function fetchPublicSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'public'));
    if (!snap.exists()) {
      return DEFAULT_SITE_SETTINGS;
    }
    const data = snap.data();
    const storedPhoneDisplay =
      typeof data.phoneDisplay === 'string' && !data.phoneDisplay.includes('Update in Admin')
        ? data.phoneDisplay
        : DEFAULT_SITE_SETTINGS.phoneDisplay;
    const storedPhoneHref =
      typeof data.phoneHref === 'string' && data.phoneHref.trim().length > 0
        ? data.phoneHref
        : DEFAULT_SITE_SETTINGS.phoneHref;
    const storedWhatsapp =
      typeof data.whatsappNumber === 'string' && data.whatsappNumber.replace(/\D/g, '').length >= 10
        ? data.whatsappNumber
        : DEFAULT_SITE_SETTINGS.whatsappNumber;
    const storedEmail =
      typeof data.email === 'string' && !data.email.endsWith('.example')
        ? data.email
        : DEFAULT_SITE_SETTINGS.email;

    return {
      ...DEFAULT_SITE_SETTINGS,
      phoneDisplay: storedPhoneDisplay,
      phoneHref: storedPhoneHref,
      whatsappNumber: storedWhatsapp,
      whatsappPrefillMessage:
        typeof data.whatsappPrefillMessage === 'string' && data.whatsappPrefillMessage.trim().length > 0
          ? data.whatsappPrefillMessage
          : DEFAULT_SITE_SETTINGS.whatsappPrefillMessage,
      email: storedEmail,
      addressLine: typeof data.addressLine === 'string' ? data.addressLine : DEFAULT_SITE_SETTINGS.addressLine,
      cityRegion: typeof data.cityRegion === 'string' ? data.cityRegion : DEFAULT_SITE_SETTINGS.cityRegion,
      workingHours: typeof data.workingHours === 'string' ? data.workingHours : DEFAULT_SITE_SETTINGS.workingHours,
      mapsEmbedUrl: typeof data.mapsEmbedUrl === 'string' ? data.mapsEmbedUrl : DEFAULT_SITE_SETTINGS.mapsEmbedUrl,
      instagramUrl: typeof data.instagramUrl === 'string' ? data.instagramUrl : DEFAULT_SITE_SETTINGS.instagramUrl,
      facebookUrl: typeof data.facebookUrl === 'string' ? data.facebookUrl : DEFAULT_SITE_SETTINGS.facebookUrl,
      linkedinUrl: typeof data.linkedinUrl === 'string' ? data.linkedinUrl : DEFAULT_SITE_SETTINGS.linkedinUrl,
      heroHeadline: typeof data.heroHeadline === 'string' ? data.heroHeadline : DEFAULT_SITE_SETTINGS.heroHeadline,
      heroSubtitle: typeof data.heroSubtitle === 'string' ? data.heroSubtitle : DEFAULT_SITE_SETTINGS.heroSubtitle,
      aboutIntro: typeof data.aboutIntro === 'string' ? data.aboutIntro : DEFAULT_SITE_SETTINGS.aboutIntro,
      complianceBannerNote:
        typeof data.complianceBannerNote === 'string'
          ? data.complianceBannerNote
          : DEFAULT_SITE_SETTINGS.complianceBannerNote,
      privacyPolicyCustomNote:
        typeof data.privacyPolicyCustomNote === 'string'
          ? data.privacyPolicyCustomNote
          : DEFAULT_SITE_SETTINGS.privacyPolicyCustomNote,
      termsCustomNote:
        typeof data.termsCustomNote === 'string'
          ? data.termsCustomNote
          : DEFAULT_SITE_SETTINGS.termsCustomNote,
      disclaimerCustomNote:
        typeof data.disclaimerCustomNote === 'string'
          ? data.disclaimerCustomNote
          : DEFAULT_SITE_SETTINGS.disclaimerCustomNote,
      loanTermsCustomNote:
        typeof data.loanTermsCustomNote === 'string'
          ? data.loanTermsCustomNote
          : DEFAULT_SITE_SETTINGS.loanTermsCustomNote,
      googleAnalyticsId:
        typeof data.googleAnalyticsId === 'string'
          ? data.googleAnalyticsId
          : DEFAULT_SITE_SETTINGS.googleAnalyticsId,
      googleSiteVerification:
        typeof data.googleSiteVerification === 'string'
          ? data.googleSiteVerification
          : DEFAULT_SITE_SETTINGS.googleSiteVerification,
    };
  } catch (error) {
    console.warn('Using default SG FINANCE site settings:', error instanceof Error ? error.message : String(error));
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function savePublicSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'site_settings', 'public'), {
      phoneDisplay: settings.phoneDisplay.trim().slice(0, 40) || DEFAULT_SITE_SETTINGS.phoneDisplay,
      phoneHref: settings.phoneHref.trim().slice(0, 30),
      whatsappNumber: settings.whatsappNumber.replace(/\D/g, '').slice(0, 20),
      whatsappPrefillMessage:
        settings.whatsappPrefillMessage.trim().slice(0, 400) || DEFAULT_SITE_SETTINGS.whatsappPrefillMessage,
      email: settings.email.trim().slice(0, 120) || DEFAULT_SITE_SETTINGS.email,
      addressLine: settings.addressLine.trim().slice(0, 300) || DEFAULT_SITE_SETTINGS.addressLine,
      cityRegion: settings.cityRegion.trim().slice(0, 120) || DEFAULT_SITE_SETTINGS.cityRegion,
      workingHours: settings.workingHours.trim().slice(0, 200) || DEFAULT_SITE_SETTINGS.workingHours,
      mapsEmbedUrl: settings.mapsEmbedUrl.trim().slice(0, 500),
      instagramUrl: settings.instagramUrl.trim().slice(0, 300),
      facebookUrl: settings.facebookUrl.trim().slice(0, 300),
      linkedinUrl: settings.linkedinUrl.trim().slice(0, 300),
      heroHeadline: settings.heroHeadline.trim().slice(0, 180) || DEFAULT_SITE_SETTINGS.heroHeadline,
      heroSubtitle: settings.heroSubtitle.trim().slice(0, 400) || DEFAULT_SITE_SETTINGS.heroSubtitle,
      aboutIntro: settings.aboutIntro.trim().slice(0, 1200) || DEFAULT_SITE_SETTINGS.aboutIntro,
      complianceBannerNote:
        settings.complianceBannerNote.trim().slice(0, 600) || DEFAULT_SITE_SETTINGS.complianceBannerNote,
      privacyPolicyCustomNote: settings.privacyPolicyCustomNote.trim().slice(0, 3000),
      termsCustomNote: settings.termsCustomNote.trim().slice(0, 3000),
      disclaimerCustomNote: settings.disclaimerCustomNote.trim().slice(0, 3000),
      loanTermsCustomNote: settings.loanTermsCustomNote.trim().slice(0, 3000),
      googleAnalyticsId: settings.googleAnalyticsId.trim().slice(0, 60),
      googleSiteVerification: settings.googleSiteVerification.trim().slice(0, 120),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_PATH);
  }
}

export function subscribeToEnquiries(
  onData: (items: EnquiryRecord[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, ENQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: EnquiryRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          referenceCode: String(d.referenceCode ?? ''),
          fullName: String(d.fullName ?? ''),
          mobileNumber: String(d.mobileNumber ?? ''),
          email: String(d.email ?? ''),
          city: String(d.city ?? ''),
          requiredAmount: String(d.requiredAmount ?? ''),
          requirementType: d.requirementType,
          preferredContact: d.preferredContact,
          message: String(d.message ?? ''),
          consentAccepted: Boolean(d.consentAccepted),
          status: (d.status as EnquiryStatus) || 'new',
          remarks: String(d.remarks ?? ''),
          source: String(d.source ?? 'website'),
          createdAt: toDate(d.createdAt),
          updatedAt: toDate(d.updatedAt),
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, ENQUIRIES_COLLECTION);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function updateEnquiryStatusAndRemarks(
  enquiryId: string,
  status: EnquiryStatus,
  remarks: string
): Promise<void> {
  const docPath = `${ENQUIRIES_COLLECTION}/${enquiryId}`;
  try {
    await updateDoc(doc(db, ENQUIRIES_COLLECTION, enquiryId), {
      status,
      remarks: remarks.trim().slice(0, 2000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteEnquiryRecord(enquiryId: string): Promise<void> {
  const docPath = `${ENQUIRIES_COLLECTION}/${enquiryId}`;
  try {
    await deleteDoc(doc(db, ENQUIRIES_COLLECTION, enquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
