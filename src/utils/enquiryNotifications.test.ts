import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEnquiryEmailHtml,
  buildEnquiryEmailText,
  buildEnquiryWhatsAppMessage,
  buildEnquiryWhatsAppUrl,
  escapeHtml,
  NOTIFICATION_EMAIL_SUBJECT,
} from './enquiryNotifications.ts';
import type { EnquiryNotificationPayload } from './enquiryNotifications.ts';
import { sendEnquiryNotificationEmail } from '../server/emailService.ts';
import {
  isWhatsAppCloudConfigured,
  sendWhatsAppCloudTemplateNotification,
} from '../server/whatsappCloudService.ts';
import { signNotifyToken, verifyNotifyToken } from '../server/notifyToken.ts';

const SAMPLE_PAYLOAD: EnquiryNotificationPayload = {
  enquiryId: 'enq_1732610000000_ab12cd',
  referenceCode: 'SGF-261126-AB12',
  fullName: 'Aarav Kulkarni',
  mobileNumber: '9822012345',
  email: 'aarav.kulkarni@example.com',
  requirementType: 'Secured Lending Solutions',
  requiredAmount: '₹3,50,000',
  city: 'Pune',
  preferredContact: 'WhatsApp',
  message: 'Looking for consultation regarding eligible pledged assets.',
  source: 'website_enquire',
  submittedAtIso: '2026-11-26T10:30:00.000Z',
};

test('buildEnquiryWhatsAppMessage formats all required fields and URL encodes cleanly to wa.me/917038391002', () => {
  const text = buildEnquiryWhatsAppMessage(SAMPLE_PAYLOAD);
  assert.ok(text.startsWith('New Website Enquiry – SG FINANCE\n\n'));
  assert.ok(text.includes('Customer Name: Aarav Kulkarni'));
  assert.ok(text.includes('Mobile Number: +91 9822012345'));
  assert.ok(text.includes('Email: aarav.kulkarni@example.com'));
  assert.ok(text.includes('Service Required: Secured Lending Solutions'));
  assert.ok(text.includes('Loan Amount: ₹3,50,000'));
  assert.ok(text.includes('Location: Pune'));
  assert.ok(text.includes('Message: Looking for consultation regarding eligible pledged assets.'));
  assert.ok(text.includes('Enquiry ID: SGF-261126-AB12'));

  const url = buildEnquiryWhatsAppUrl('917038391002', SAMPLE_PAYLOAD);
  assert.ok(url.startsWith('https://wa.me/917038391002?text='));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.equal(decoded, text);
});

test('buildEnquiryEmailHtml renders SG FINANCE branding, clickable tel link, and escapes XSS input', () => {
  const hostilePayload: EnquiryNotificationPayload = {
    ...SAMPLE_PAYLOAD,
    fullName: 'Rohan <script>alert(1)</script> "Test"',
    message: 'Line 1\n<img src=x onerror=alert(1)>',
  };

  const html = buildEnquiryEmailHtml(hostilePayload);
  assert.ok(html.includes('#0B1628'));
  assert.ok(html.includes('#B99752'));
  assert.ok(html.includes('#F7F5F0'));
  assert.ok(html.includes('href="tel:+919822012345"'));
  assert.ok(html.includes('SGF-261126-AB12'));
  assert.ok(html.includes('IST'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(escapeHtml(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');

  const plainText = buildEnquiryEmailText(SAMPLE_PAYLOAD);
  assert.ok(plainText.includes('Enquiry ID: SGF-261126-AB12'));
  assert.ok(plainText.includes('Mobile Number: +91 9822012345'));
});

test('sendEnquiryNotificationEmail fails gracefully when RESEND_API_KEY or FROM_EMAIL is missing', async () => {
  const missingKey = await sendEnquiryNotificationEmail(SAMPLE_PAYLOAD, {
    resendApiKey: '',
    notificationEmail: 'in.sg.infra@gmail.com',
    fromEmail: 'SG FINANCE <enquiries@verified-domain.example>',
  });
  assert.equal(missingKey.ok, false);
  assert.equal(missingKey.status, 'failed');
  assert.match(missingKey.error || '', /RESEND_API_KEY/);

  const missingFrom = await sendEnquiryNotificationEmail(SAMPLE_PAYLOAD, {
    resendApiKey: 're_test_dummy_key',
    notificationEmail: 'in.sg.infra@gmail.com',
    fromEmail: '',
  });
  assert.equal(missingFrom.ok, false);
  assert.equal(missingFrom.status, 'failed');
  assert.match(missingFrom.error || '', /FROM_EMAIL/);
});

test('sendEnquiryNotificationEmail sends exact Resend API payload and handles provider failures gracefully', async () => {
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;

  const mockSuccessFetch: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return new Response(JSON.stringify({ id: 'email_mock_12345' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const success = await sendEnquiryNotificationEmail(
    SAMPLE_PAYLOAD,
    {
      resendApiKey: 're_mock_secret',
      notificationEmail: 'in.sg.infra@gmail.com',
      fromEmail: 'SG FINANCE <enquiries@verified-domain.example>',
    },
    mockSuccessFetch,
    1
  );

  assert.equal(success.ok, true);
  assert.equal(success.status, 'sent');
  assert.equal(success.providerMessageId, 'email_mock_12345');
  assert.ok(success.notifiedAt);
  assert.equal(capturedUrl, 'https://api.resend.com/emails');

  const headers = capturedInit?.headers as Record<string, string>;
  assert.equal(headers.Authorization, 'Bearer re_mock_secret');
  assert.equal(headers['Idempotency-Key'], 'sgf-enquiry-SGF-261126-AB12-a1');

  const sentBody = JSON.parse(String(capturedInit?.body)) as {
    from: string;
    to: string[];
    subject: string;
    reply_to: string;
    html: string;
    text: string;
  };
  assert.equal(sentBody.from, 'SG FINANCE <enquiries@verified-domain.example>');
  assert.deepEqual(sentBody.to, ['in.sg.infra@gmail.com']);
  assert.equal(sentBody.subject, NOTIFICATION_EMAIL_SUBJECT);
  assert.equal(sentBody.reply_to, 'aarav.kulkarni@example.com');
  assert.ok(sentBody.html.includes('tel:+919822012345'));
  assert.ok(sentBody.text.includes('SGF-261126-AB12'));

  const mockFailureFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ message: 'Domain not verified' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });

  const failed = await sendEnquiryNotificationEmail(
    SAMPLE_PAYLOAD,
    {
      resendApiKey: 're_mock_secret',
      notificationEmail: 'in.sg.infra@gmail.com',
      fromEmail: 'SG FINANCE <enquiries@unverified.example>',
    },
    mockFailureFetch,
    2
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.status, 'failed');
  assert.match(failed.error || '', /403/);
  assert.match(failed.error || '', /Domain not verified/);
});

test('WhatsApp Business Cloud API module stays strictly dormant unless explicitly enabled and configured', async () => {
  let called = false;
  const spyFetch: typeof fetch = async () => {
    called = true;
    return new Response(JSON.stringify({ messages: [{ id: 'wamid.test' }] }), { status: 200 });
  };

  const disabledConfig = {
    enabled: false,
    accessToken: 'token',
    phoneNumberId: '123456',
    recipientNumber: '917038391002',
    templateName: 'sgf_enquiry',
    templateLanguage: 'en',
    graphApiVersion: 'v21.0',
  };
  assert.equal(isWhatsAppCloudConfigured(disabledConfig), false);
  const disabledRes = await sendWhatsAppCloudTemplateNotification(
    SAMPLE_PAYLOAD,
    disabledConfig,
    spyFetch
  );
  assert.equal(disabledRes.attempted, false);
  assert.equal(disabledRes.status, 'disabled');
  assert.equal(called, false);

  const enabledConfig = { ...disabledConfig, enabled: true };
  assert.equal(isWhatsAppCloudConfigured(enabledConfig), true);
  const enabledRes = await sendWhatsAppCloudTemplateNotification(
    SAMPLE_PAYLOAD,
    enabledConfig,
    spyFetch
  );
  assert.equal(called, true);
  assert.equal(enabledRes.attempted, true);
  assert.equal(enabledRes.ok, true);
  assert.equal(enabledRes.status, 'sent');
});

test('notifyToken verifies valid signatures and rejects tampering, mismatch, or expiry', () => {
  const now = 1_700_000_000_000;
  const secret = 'test-signing-secret-at-least-32-chars';
  const token = signNotifyToken('SGF-261126-AB12', '9822012345', now, 60_000, secret);

  assert.equal(
    verifyNotifyToken(token, 'SGF-261126-AB12', '9822012345', now + 10_000, secret).valid,
    true
  );
  assert.equal(
    verifyNotifyToken(`${token}tampered`, 'SGF-261126-AB12', '9822012345', now + 10_000, secret)
      .valid,
    false
  );
  assert.equal(
    verifyNotifyToken(token, 'SGF-261126-XXXX', '9822012345', now + 10_000, secret).valid,
    false
  );
  assert.equal(
    verifyNotifyToken(token, 'SGF-261126-AB12', '9822012345', now + 120_000, secret).valid,
    false
  );
});
