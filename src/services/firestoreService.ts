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
import { formatIndianPhoneDisplay } from '../config/contact';
import {
  EMAIL_REGEX,
  generateReferenceCode,
  validateEnquiryInput,
} from '../utils/validation';
import type {
  AdminProfile,
  EmailNotificationStatus,
  EnquiryFormInput,
  EnquiryRecord,
  EnquiryStatus,
  NotificationRetryStatus,
  SiteSettings,
} from '../types/site';
import type { EnquiryNotificationPayload } from '../utils/enquiryNotifications';

const SETTINGS_PATH = 'site_settings/public';
const ENQUIRIES_COLLECTION = 'enquiries';
const ADMINS_COLLECTION = 'admins';
const VALID_DOC_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

// Local in-memory duplicate cooldown backup (in case static hosting skips Express)
const recentMobileSubmissions = new Map<string, number>();

export interface EnquirySubmissionOutcome {
  ok: boolean;
  enquiryId?: string;
  referenceCode?: string;
  submittedPayload?: EnquiryNotificationPayload;
  emailNotificationStatus?: EmailNotificationStatus;
  errorMessage?: string;
  fieldErrors?: Partial<Record<keyof EnquiryFormInput, string>>;
}

export interface ServerNotificationStatusRecord {
  enquiryId: string;
  referenceCode: string;
  emailNotificationStatus: EmailNotificationStatus;
  emailNotificationError: string;
  emailNotificationAttempts: number;
  emailNotificationRetryStatus: NotificationRetryStatus;
  emailNotifiedAt: string;
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

  // Step 1: Server-side anti-spam, duplicate-prevention, and validation gate
  let referenceCode = generateReferenceCode();
  let notifyToken = '';
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
        notifyToken?: string;
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
      if (payload.notifyToken) {
        notifyToken = payload.notifyToken;
      }
    }
  } catch {
    // If Express validation endpoint is unreachable in a static preview, Firestore rules still enforce full schema integrity.
  }

  const cleanId = `enq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const docPath = `${ENQUIRIES_COLLECTION}/${cleanId}`;
  const cleanSource = source.trim().slice(0, 60) || 'website';

  // Step 2 & 3: Save enquiry to Firestore and confirm storage BEFORE triggering any notifications
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
      source: cleanSource,
      emailNotificationStatus: 'pending',
      emailNotificationError: '',
      emailNotificationAttempts: 0,
      emailNotificationRetryStatus: 'none',
      emailNotifiedAt: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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

  recentMobileSubmissions.set(normalizedMobile, Date.now() + 90_000);

  const submittedPayload: EnquiryNotificationPayload = {
    enquiryId: cleanId,
    referenceCode,
    fullName: localValidation.sanitized.fullName,
    mobileNumber: localValidation.sanitized.mobileNumber,
    email: localValidation.sanitized.email,
    requirementType: localValidation.sanitized.requirementType,
    requiredAmount: localValidation.sanitized.requiredAmount,
    city: localValidation.sanitized.city,
    preferredContact: localValidation.sanitized.preferredContact,
    message: localValidation.sanitized.message,
    source: cleanSource,
    submittedAtIso: new Date().toISOString(),
  };

  // Step 4: Trigger backend email notification AFTER confirmed Firestore save.
  // Failure here MUST NOT lose or invalidate the saved enquiry.
  let emailNotificationStatus: EmailNotificationStatus = 'pending';
  if (notifyToken) {
    try {
      const notifyRes = await fetch('/api/enquiries/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submittedPayload,
          consentAccepted: true,
          notifyToken,
        }),
      });
      if (notifyRes.ok) {
        const notifyJson = (await notifyRes.json()) as {
          emailNotificationStatus?: EmailNotificationStatus;
        };
        if (
          notifyJson.emailNotificationStatus === 'sent' ||
          notifyJson.emailNotificationStatus === 'failed'
        ) {
          emailNotificationStatus = notifyJson.emailNotificationStatus;
        }
      } else {
        emailNotificationStatus = 'failed';
      }
    } catch {
      emailNotificationStatus = 'failed';
    }
  }

  // Step 5: Return confirmed enquiry details for customer success view & WhatsApp follow-up
  return {
    ok: true,
    enquiryId: cleanId,
    referenceCode,
    submittedPayload,
    emailNotificationStatus,
  };
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
        ? formatIndianPhoneDisplay(data.phoneDisplay)
        : DEFAULT_SITE_SETTINGS.phoneDisplay;
    const rawPhoneHref =
      typeof data.phoneHref === 'string' && data.phoneHref.trim().length > 0
        ? data.phoneHref.replace(/[^\d+]/g, '')
        : DEFAULT_SITE_SETTINGS.phoneHref;
    const storedPhoneHref = /^[6-9]\d{9}$/.test(rawPhoneHref)
      ? `+91${rawPhoneHref}`
      : /^91[6-9]\d{9}$/.test(rawPhoneHref)
        ? `+${rawPhoneHref}`
        : rawPhoneHref;
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
      addressLine:
        typeof data.addressLine === 'string' && !data.addressLine.includes('Update in Admin')
          ? data.addressLine
          : DEFAULT_SITE_SETTINGS.addressLine,
      cityRegion: typeof data.cityRegion === 'string' ? data.cityRegion : DEFAULT_SITE_SETTINGS.cityRegion,
      workingHours:
        typeof data.workingHours === 'string' && !data.workingHours.includes('Update Working Hours')
          ? data.workingHours
          : DEFAULT_SITE_SETTINGS.workingHours,
      mapsEmbedUrl: typeof data.mapsEmbedUrl === 'string' ? data.mapsEmbedUrl : DEFAULT_SITE_SETTINGS.mapsEmbedUrl,
      instagramUrl: typeof data.instagramUrl === 'string' ? data.instagramUrl : DEFAULT_SITE_SETTINGS.instagramUrl,
      facebookUrl: typeof data.facebookUrl === 'string' ? data.facebookUrl : DEFAULT_SITE_SETTINGS.facebookUrl,
      linkedinUrl: typeof data.linkedinUrl === 'string' ? data.linkedinUrl : DEFAULT_SITE_SETTINGS.linkedinUrl,
      heroHeadline:
        typeof data.heroHeadline === 'string' &&
        data.heroHeadline.trim() !== 'Financial Solutions Built Around Trust and Security.'
          ? data.heroHeadline
          : DEFAULT_SITE_SETTINGS.heroHeadline,
      heroSubtitle:
        typeof data.heroSubtitle === 'string' &&
        data.heroSubtitle.trim() !==
          'Explore secured financial solutions with a transparent process, professional assistance and customer-focused service.'
          ? data.heroSubtitle
          : DEFAULT_SITE_SETTINGS.heroSubtitle,
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
    const cleanPhoneDisplay = formatIndianPhoneDisplay(
      settings.phoneDisplay.trim().slice(0, 40) || DEFAULT_SITE_SETTINGS.phoneDisplay
    );
    await setDoc(doc(db, 'site_settings', 'public'), {
      phoneDisplay: cleanPhoneDisplay.slice(0, 40),
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
          emailNotificationStatus:
            d.emailNotificationStatus === 'sent' ||
            d.emailNotificationStatus === 'failed' ||
            d.emailNotificationStatus === 'pending'
              ? d.emailNotificationStatus
              : 'pending',
          emailNotificationError: String(d.emailNotificationError ?? ''),
          emailNotificationAttempts:
            typeof d.emailNotificationAttempts === 'number' &&
            Number.isFinite(d.emailNotificationAttempts)
              ? d.emailNotificationAttempts
              : 0,
          emailNotificationRetryStatus:
            d.emailNotificationRetryStatus === 'retrying' ||
            d.emailNotificationRetryStatus === 'retried_sent' ||
            d.emailNotificationRetryStatus === 'retried_failed' ||
            d.emailNotificationRetryStatus === 'none'
              ? d.emailNotificationRetryStatus
              : 'none',
          emailNotifiedAt: String(d.emailNotifiedAt ?? ''),
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

export async function updateEnquiryNotificationStatus(
  enquiryId: string,
  update: {
    emailNotificationStatus: EmailNotificationStatus;
    emailNotificationError: string;
    emailNotificationAttempts: number;
    emailNotificationRetryStatus: NotificationRetryStatus;
    emailNotifiedAt: string;
  }
): Promise<void> {
  const docPath = `${ENQUIRIES_COLLECTION}/${enquiryId}`;
  try {
    await updateDoc(doc(db, ENQUIRIES_COLLECTION, enquiryId), {
      emailNotificationStatus: update.emailNotificationStatus,
      emailNotificationError: update.emailNotificationError.trim().slice(0, 300),
      emailNotificationAttempts: Math.max(0, Math.min(50, Math.floor(update.emailNotificationAttempts))),
      emailNotificationRetryStatus: update.emailNotificationRetryStatus,
      emailNotifiedAt: update.emailNotifiedAt.trim().slice(0, 40),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function fetchServerNotificationStatuses(
  idToken: string
): Promise<Record<string, ServerNotificationStatusRecord>> {
  try {
    const res = await fetch('/api/enquiries/notifications', {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as {
      ok?: boolean;
      records?: Record<string, ServerNotificationStatusRecord>;
    };
    return data.ok && data.records ? data.records : {};
  } catch {
    return {};
  }
}

export async function retryEnquiryEmailNotification(
  idToken: string,
  enquiry: EnquiryRecord
): Promise<{
  ok: boolean;
  emailNotificationStatus: EmailNotificationStatus;
  emailNotificationError: string;
  emailNotificationAttempts: number;
  emailNotificationRetryStatus: NotificationRetryStatus;
  emailNotifiedAt: string;
}> {
  const res = await fetch('/api/enquiries/notify/retry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      enquiryId: enquiry.id,
      referenceCode: enquiry.referenceCode,
      fullName: enquiry.fullName,
      mobileNumber: enquiry.mobileNumber,
      email: enquiry.email,
      city: enquiry.city,
      requiredAmount: enquiry.requiredAmount,
      requirementType: enquiry.requirementType,
      preferredContact: enquiry.preferredContact,
      message: enquiry.message,
      source: enquiry.source,
      submittedAtIso: enquiry.createdAt ? enquiry.createdAt.toISOString() : new Date().toISOString(),
      previousAttempts: enquiry.emailNotificationAttempts ?? 0,
    }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    message?: string;
    emailNotificationStatus?: EmailNotificationStatus;
    emailNotificationError?: string;
    emailNotificationAttempts?: number;
    emailNotificationRetryStatus?: NotificationRetryStatus;
    emailNotifiedAt?: string;
  };

  if (!res.ok) {
    throw new Error(data.message || 'Unable to retry email notification.');
  }

  return {
    ok: Boolean(data.ok),
    emailNotificationStatus: data.emailNotificationStatus === 'sent' ? 'sent' : 'failed',
    emailNotificationError: data.emailNotificationError || '',
    emailNotificationAttempts:
      typeof data.emailNotificationAttempts === 'number'
        ? data.emailNotificationAttempts
        : (enquiry.emailNotificationAttempts ?? 0) + 1,
    emailNotificationRetryStatus:
      data.emailNotificationRetryStatus === 'retried_sent'
        ? 'retried_sent'
        : 'retried_failed',
    emailNotifiedAt: data.emailNotifiedAt || '',
  };
}

export async function deleteEnquiryRecord(enquiryId: string): Promise<void> {
  const docPath = `${ENQUIRIES_COLLECTION}/${enquiryId}`;
  try {
    await deleteDoc(doc(db, ENQUIRIES_COLLECTION, enquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeToStaffAdmins(
  onData: (admins: AdminProfile[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, ADMINS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const admins: AdminProfile[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          uid: docSnap.id,
          email: String(d.email ?? ''),
          displayName: String(d.displayName ?? ''),
          role: 'admin',
          createdAt: toDate(d.createdAt),
        };
      });
      onData(admins);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, ADMINS_COLLECTION);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function addStaffAdmin(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  const cleanUid = uid.trim();
  const cleanEmail = email.trim().toLowerCase().slice(0, 120);
  const cleanName = displayName.trim().slice(0, 100);

  if (!VALID_DOC_ID_REGEX.test(cleanUid)) {
    throw new Error('Firebase User UID must contain only letters, numbers, hyphens, or underscores.');
  }
  if (cleanEmail.length < 5 || !EMAIL_REGEX.test(cleanEmail)) {
    throw new Error('Please enter a valid staff Google email address.');
  }
  if (cleanName.length < 1) {
    throw new Error('Please enter the staff member’s display name.');
  }

  const docPath = `${ADMINS_COLLECTION}/${cleanUid}`;
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, cleanUid), {
      email: cleanEmail,
      displayName: cleanName,
      role: 'admin',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function removeStaffAdmin(uid: string): Promise<void> {
  const cleanUid = uid.trim();
  const docPath = `${ADMINS_COLLECTION}/${cleanUid}`;
  try {
    await deleteDoc(doc(db, ADMINS_COLLECTION, cleanUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
