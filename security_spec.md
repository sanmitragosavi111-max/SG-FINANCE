# SG FINANCE Firestore Security Specification

## 1. Data Invariants
1. **Zero Public PII Exposure**: Customer enquiries (`/enquiries/{enquiryId}`) contain PII (`fullName`, `mobileNumber`, `city`, `message`). Public visitors and non-admin signed-in users may NEVER `get`, `list`, `update`, or `delete` any enquiry document.
2. **Strict Lead Intake Schema**: Public `create` on `/enquiries/{enquiryId}` must enforce exact required/allowed keys (`hasAll` + `hasOnly`), valid Indian mobile number (`^[6-9][0-9]{9}$`), `consentAccepted == true`, initial `status == 'new'`, empty initial `remarks == ''`, server timestamps (`createdAt == request.time`, `updatedAt == request.time`), and strict string length bounds.
3. **Immutable Customer Fields**: When an admin updates an enquiry, customer-submitted fields (`fullName`, `mobileNumber`, `city`, `requiredAmount`, `requirementType`, `preferredContact`, `message`, `consentAccepted`, `source`, `referenceCode`, `createdAt`) must remain strictly immutable; only `status`, `remarks`, and `updatedAt` may change.
4. **Verified Admin Identity**: Admin privileges require `request.auth != null` AND `request.auth.token.email_verified == true` AND either the bootstrapped owner email (`sanmitragosavi111@gmail.com`) or a document in `/admins/{uid}` created solely by the bootstrapped owner.
5. **Single Public Config Document**: `/site_settings/public` is public-read (`get` only, no `list`), writable only by verified admins, and never deletable.
6. **Global Default Deny**: Any unmatched path is denied (`allow read, write: if false;`).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Public PII Read (`get /enquiries/enq_1`)**: Unauthenticated or non-admin user tries to read an enquiry -> `PERMISSION_DENIED`.
2. **Public PII Scrape (`list /enquiries`)**: Unauthenticated or non-admin user tries to list enquiries -> `PERMISSION_DENIED`.
3. **Shadow Field Injection (`create /enquiries/enq_2`)**: Public enquiry includes ghost field `isApproved: true` -> `PERMISSION_DENIED`.
4. **Invalid Mobile Number (`create /enquiries/enq_3`)**: `mobileNumber: "12345"` or `"0000000000"` -> `PERMISSION_DENIED`.
5. **Missing Consent (`create /enquiries/enq_4`)**: `consentAccepted: false` -> `PERMISSION_DENIED`.
6. **Status Tampering on Create (`create /enquiries/enq_5`)**: Public visitor submits `status: "closed"` or non-empty `remarks` -> `PERMISSION_DENIED`.
7. **Forged Timestamp (`create /enquiries/enq_6`)**: Client sends a past timestamp instead of `serverTimestamp()` -> `PERMISSION_DENIED`.
8. **ID Poisoning (`create /enquiries/<200-char-invalid-id>`)**: Document ID exceeds 128 chars or contains invalid characters -> `PERMISSION_DENIED`.
9. **Oversized Payload / Denial of Wallet (`create /enquiries/enq_7`)**: `message` > 1000 chars or `fullName` > 100 chars -> `PERMISSION_DENIED`.
10. **Admin Mutating Immutable Customer PII (`update /enquiries/enq_1`)**: Admin attempts to modify `mobileNumber` or `createdAt` -> `PERMISSION_DENIED`.
11. **Unverified Email Spoofing (`get /enquiries/enq_1`)**: Auth token matches admin email with `email_verified: false` -> `PERMISSION_DENIED`.
12. **Unauthorized Site Settings Tampering (`update /site_settings/public`)**: Non-admin tries to overwrite WhatsApp number or website copy -> `PERMISSION_DENIED`.
