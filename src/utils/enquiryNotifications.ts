import { buildWhatsAppUrl, normalizeIndianMobile } from './validation.ts';

export interface EnquiryNotificationPayload {
  enquiryId: string;
  referenceCode: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  requirementType: string;
  requiredAmount: string;
  city: string;
  preferredContact?: string;
  message: string;
  source?: string;
  submittedAtIso?: string;
}

export const NOTIFICATION_EMAIL_SUBJECT = 'New Customer Enquiry – SG FINANCE';

export function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatEnquiryTimestampIST(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return (
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(validDate) + ' IST'
  );
}

export function formatIndianTelHref(mobileNumber: string): string {
  const normalized = normalizeIndianMobile(mobileNumber);
  if (/^[6-9]\d{9}$/.test(normalized)) {
    return `tel:+91${normalized}`;
  }
  const digits = String(mobileNumber ?? '').replace(/\D/g, '');
  return digits ? `tel:+${digits}` : 'tel:+917038391002';
}

export function formatIndianDisplayMobile(mobileNumber: string): string {
  const normalized = normalizeIndianMobile(mobileNumber);
  if (/^[6-9]\d{9}$/.test(normalized)) {
    return `+91 ${normalized}`;
  }
  return String(mobileNumber ?? '').trim() || 'Not provided';
}

/**
 * Generates the exact structured pre-filled WhatsApp enquiry message
 * so the customer can review and manually send their enquiry on WhatsApp.
 */
export function buildEnquiryWhatsAppMessage(payload: EnquiryNotificationPayload): string {
  const displayMobile = formatIndianDisplayMobile(payload.mobileNumber);
  const emailValue = payload.email?.trim() || 'Not provided';
  const amountValue = payload.requiredAmount?.trim() || 'Not specified';
  const locationValue = payload.city?.trim() || 'Not specified';
  const messageValue = payload.message?.trim() || 'None';
  const enquiryIdValue = payload.referenceCode?.trim() || payload.enquiryId?.trim() || 'Pending';

  return [
    'New Website Enquiry – SG FINANCE',
    '',
    `Customer Name: ${payload.fullName.trim()}`,
    `Mobile Number: ${displayMobile}`,
    `Email: ${emailValue}`,
    `Service Required: ${payload.requirementType.trim()}`,
    `Loan Amount: ${amountValue}`,
    `Location: ${locationValue}`,
    `Message: ${messageValue}`,
    '',
    `Enquiry ID: ${enquiryIdValue}`,
  ].join('\n');
}

/**
 * Builds the properly URL-encoded https://wa.me/917038391002?text=... link
 * with all customer enquiry fields pre-filled.
 */
export function buildEnquiryWhatsAppUrl(
  whatsappNumber: string,
  payload: EnquiryNotificationPayload
): string {
  const targetNumber = whatsappNumber.replace(/\D/g, '') || '917038391002';
  return buildWhatsAppUrl(targetNumber, buildEnquiryWhatsAppMessage(payload));
}

/**
 * Generates a plain-text fallback for transactional email clients.
 */
export function buildEnquiryEmailText(payload: EnquiryNotificationPayload): string {
  const displayMobile = formatIndianDisplayMobile(payload.mobileNumber);
  const formattedTime = formatEnquiryTimestampIST(payload.submittedAtIso);

  return [
    'SG FINANCE — NEW CUSTOMER ENQUIRY',
    '==================================================',
    '',
    `Enquiry ID: ${payload.referenceCode}`,
    `Submitted At: ${formattedTime}`,
    '',
    `Customer Full Name: ${payload.fullName}`,
    `Mobile Number: ${displayMobile}`,
    `Email Address: ${payload.email || 'Not provided'}`,
    `Service Required: ${payload.requirementType}`,
    `Required Loan Amount: ${payload.requiredAmount || 'Not specified'}`,
    `City / Location: ${payload.city}`,
    `Preferred Contact: ${payload.preferredContact || 'Not specified'}`,
    `Enquiry Source: ${payload.source || 'website'}`,
    '',
    'Customer Message:',
    payload.message || 'No additional message provided.',
    '',
    '--------------------------------------------------',
    'This enquiry has been saved in the SG FINANCE Admin Dashboard.',
    'SG FINANCE · Pune, Maharashtra, India',
  ].join('\n');
}

/**
 * Generates a branded SG FINANCE HTML notification email (Navy #0B1628, Gold #B99752, Ivory #F7F5F0).
 * Every customer-supplied field is strictly HTML-escaped to prevent injection.
 */
export function buildEnquiryEmailHtml(payload: EnquiryNotificationPayload): string {
  const safeRef = escapeHtml(payload.referenceCode);
  const safeName = escapeHtml(payload.fullName);
  const displayMobile = formatIndianDisplayMobile(payload.mobileNumber);
  const safeMobileDisplay = escapeHtml(displayMobile);
  const telHref = escapeHtml(formatIndianTelHref(payload.mobileNumber));
  const safeEmail = payload.email?.trim() ? escapeHtml(payload.email.trim()) : '';
  const safeService = escapeHtml(payload.requirementType);
  const safeAmount = escapeHtml(payload.requiredAmount || 'Not specified');
  const safeCity = escapeHtml(payload.city);
  const safePreferred = escapeHtml(payload.preferredContact || 'Not specified');
  const safeSource = escapeHtml(payload.source || 'website');
  const safeSubmittedAt = escapeHtml(formatEnquiryTimestampIST(payload.submittedAtIso));
  const safeMessageHtml = payload.message?.trim()
    ? escapeHtml(payload.message.trim()).replace(/\r?\n/g, '<br />')
    : '<span style="color:#747C86;">No additional message provided.</span>';

  const whatsappCustomerUrl = escapeHtml(
    buildWhatsAppUrl(
      payload.mobileNumber,
      `Hello ${payload.fullName}, this is SG FINANCE regarding your enquiry (${payload.referenceCode}).`
    )
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(NOTIFICATION_EMAIL_SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;color:#202A36;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F7F5F0;padding:28px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E5DFD3;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0B1628;padding:28px 32px;border-bottom:3px solid #B99752;">
              <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:2px;color:#D4BC85;text-transform:uppercase;">
                SG FINANCE · PUNE, MAHARASHTRA
              </p>
              <h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:24px;font-weight:600;color:#FFFFFF;line-height:1.3;">
                New Customer Enquiry Received
              </h1>
              <p style="margin:10px 0 0 0;font-size:13px;color:#CBD5E1;">
                Enquiry ID: <strong style="color:#D4BC85;font-family:monospace;">${safeRef}</strong> &nbsp;|&nbsp; ${safeSubmittedAt}
              </p>
            </td>
          </tr>

          <!-- Quick Action Bar -->
          <tr>
            <td style="background-color:#F7F5F0;padding:18px 32px;border-bottom:1px solid #E5DFD3;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${telHref}" style="display:inline-block;background-color:#0B1628;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border:1px solid #0B1628;">
                      Call Customer: ${safeMobileDisplay}
                    </a>
                  </td>
                  <td>
                    <a href="${whatsappCustomerUrl}" style="display:inline-block;background-color:#B99752;color:#0B1628;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border:1px solid #B99752;">
                      WhatsApp Customer
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Enquiry Details Table -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px 0;font-size:11px;font-weight:700;letter-spacing:1.4px;color:#B99752;text-transform:uppercase;">
                Customer &amp; Requirement Details
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;width:38%;vertical-align:top;">Customer Full Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#0B1628;font-weight:600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Mobile Number</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#0B1628;font-weight:600;">
                    <a href="${telHref}" style="color:#0B1628;text-decoration:underline;">${safeMobileDisplay}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Email Address</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#202A36;">
                    ${safeEmail ? `<a href="mailto:${safeEmail}" style="color:#0B1628;text-decoration:underline;">${safeEmail}</a>` : '<span style="color:#747C86;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Service Required</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#0B1628;font-weight:600;">${safeService}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Required Loan Amount</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#0B1628;font-weight:600;">${safeAmount}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">City / Location</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#202A36;">${safeCity}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Preferred Contact</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#202A36;">${safePreferred}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Enquiry Source</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#202A36;">${safeSource}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;border-bottom:1px solid #F0ECE4;color:#747C86;vertical-align:top;">Unique Enquiry ID</td>
                  <td style="padding:10px 0;border-bottom:1px solid #F0ECE4;color:#0B1628;font-family:monospace;font-weight:600;">${safeRef}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px 10px 0;color:#747C86;vertical-align:top;">Submission Date &amp; Time</td>
                  <td style="padding:10px 0;color:#202A36;">${safeSubmittedAt}</td>
                </tr>
              </table>

              <!-- Customer Message Box -->
              <div style="margin-top:22px;padding:16px 18px;background-color:#F7F5F0;border-left:3px solid #B99752;">
                <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:1px;color:#747C86;text-transform:uppercase;">
                  Customer Message
                </p>
                <p style="margin:0;font-size:14px;color:#202A36;line-height:1.6;">
                  ${safeMessageHtml}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#101F35;padding:18px 32px;color:#CBD5E1;font-size:12px;line-height:1.6;">
              <p style="margin:0;">
                This notification was sent automatically after the enquiry was securely stored in the SG FINANCE database. Manage follow-up status and remarks in the SG FINANCE Admin Dashboard.
              </p>
              <p style="margin:8px 0 0 0;color:#94A3B8;">
                SG FINANCE · Pune, Maharashtra, India · +91 7038391002 · in.sg.infra@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
