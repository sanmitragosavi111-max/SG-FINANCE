import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeIndianMobile,
  isValidIndianMobile,
  validateEnquiryInput,
  generateReferenceCode,
  buildWhatsAppUrl,
  sanitizeExternalUrl,
  filterEnquiries,
  REFERENCE_CODE_REGEX,
} from './validation';
import { enquiriesToCsv } from './csv';
import {
  OFFICIAL_CONTACT,
  getTelHref,
  getMailtoHref,
} from '../config/contact';
import type { EnquiryRecord } from '../types/site';

test('official central contact config generates exact tel, WhatsApp, and mailto URLs', () => {
  assert.equal(OFFICIAL_CONTACT.phoneDisplay, '+91 7038391002');
  assert.equal(getTelHref(OFFICIAL_CONTACT.phoneHref), 'tel:+917038391002');
  assert.equal(
    buildWhatsAppUrl(OFFICIAL_CONTACT.whatsappNumber, OFFICIAL_CONTACT.whatsappPrefillMessage),
    'https://wa.me/917038391002?text=Hello%20SG%20FINANCE%2C%20I%20would%20like%20to%20enquire%20about%20your%20financial%20services.%20Please%20contact%20me.'
  );
  assert.equal(
    getMailtoHref(OFFICIAL_CONTACT.email),
    'mailto:in.sg.infra@gmail.com?subject=SG%20FINANCE%20Customer%20Enquiry'
  );
});

test('normalizeIndianMobile handles +91, 91, leading 0, spaces, and dashes', () => {
  assert.equal(normalizeIndianMobile('+91 98220-12345'), '9822012345');
  assert.equal(normalizeIndianMobile('919876543210'), '9876543210');
  assert.equal(normalizeIndianMobile('09876543210'), '9876543210');
  assert.equal(normalizeIndianMobile(' 70123 45678 '), '7012345678');
});

test('isValidIndianMobile accepts 10-digit numbers starting with 6-9 and rejects invalid numbers', () => {
  assert.equal(isValidIndianMobile('9822012345'), true);
  assert.equal(isValidIndianMobile('+91 6123456789'), true);
  assert.equal(isValidIndianMobile('5123456789'), false);
  assert.equal(isValidIndianMobile('12345'), false);
  assert.equal(isValidIndianMobile('0000000000'), false);
  assert.equal(isValidIndianMobile('98220123456'), false);
});

test('validateEnquiryInput rejects missing fields, invalid mobile, invalid email, and unchecked consent', () => {
  const result = validateEnquiryInput({
    fullName: 'A',
    mobileNumber: '1234567890',
    email: 'invalid-email',
    city: '',
    requiredAmount: '',
    requirementType: 'Invalid Product',
    preferredContact: 'Carrier Pigeon',
    message: '',
    consentAccepted: false,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.mobileNumber);
  assert.ok(result.errors.email);
  assert.ok(result.errors.city);
  assert.ok(result.errors.requiredAmount);
  assert.ok(result.errors.requirementType);
  assert.ok(result.errors.preferredContact);
  assert.ok(result.errors.consentAccepted);
});

test('validateEnquiryInput accepts valid enquiry with optional email empty or valid', () => {
  const withEmail = validateEnquiryInput({
    fullName: '  Rohan Deshmukh  ',
    mobileNumber: '+91 98220 12345',
    email: ' rohan@example.com ',
    city: ' Pune ',
    requiredAmount: '₹2,50,000',
    requirementType: 'Secured Lending Solutions',
    preferredContact: 'WhatsApp',
    message: 'Looking for consultation regarding eligible pledged assets.',
    consentAccepted: true,
  });

  assert.equal(withEmail.valid, true);
  assert.deepEqual(withEmail.errors, {});
  assert.equal(withEmail.sanitized.fullName, 'Rohan Deshmukh');
  assert.equal(withEmail.sanitized.mobileNumber, '9822012345');
  assert.equal(withEmail.sanitized.email, 'rohan@example.com');
  assert.equal(withEmail.sanitized.city, 'Pune');

  const withoutEmail = validateEnquiryInput({
    fullName: 'Rohan Deshmukh',
    mobileNumber: '9822012345',
    email: '',
    city: 'Pune',
    requiredAmount: '₹2,50,000',
    requirementType: 'Secured Lending Solutions',
    preferredContact: 'Phone Call',
    message: '',
    consentAccepted: true,
  });
  assert.equal(withoutEmail.valid, true);
  assert.equal(withoutEmail.sanitized.email, '');
});

test('generateReferenceCode matches Firestore schema regex', () => {
  const code = generateReferenceCode(new Date('2026-11-24T10:00:00Z'));
  assert.equal(REFERENCE_CODE_REGEX.test(code), true);
  assert.ok(code.startsWith('SGF-261124-'));
});

test('buildWhatsAppUrl formats Indian numbers with 91 prefix and falls back cleanly when unconfigured', () => {
  const withNumber = buildWhatsAppUrl('9822012345', 'Hello SG FINANCE');
  assert.equal(withNumber, 'https://wa.me/919822012345?text=Hello%20SG%20FINANCE');

  const withoutNumber = buildWhatsAppUrl('', 'Hello SG FINANCE');
  assert.equal(withoutNumber, 'https://wa.me/?text=Hello%20SG%20FINANCE');
});

test('sanitizeExternalUrl allows http/https and blocks javascript/data schemes', () => {
  assert.equal(sanitizeExternalUrl('https://instagram.com/sgfinance'), 'https://instagram.com/sgfinance');
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeExternalUrl('not-a-url'), null);
});

test('filterEnquiries filters by search text, status, and date range', () => {
  const records: EnquiryRecord[] = [
    {
      id: '1',
      referenceCode: 'SGF-261120-AAAA',
      fullName: 'Meera Kulkarni',
      mobileNumber: '9822001122',
      email: 'meera@example.com',
      city: 'Pune',
      requiredAmount: '₹3,00,000',
      requirementType: 'Secured Lending Solutions',
      preferredContact: 'Phone Call',
      message: 'Need short term advice',
      consentAccepted: true,
      status: 'new',
      remarks: '',
      source: 'website_home',
      createdAt: new Date('2026-11-20T09:00:00Z'),
      updatedAt: new Date('2026-11-20T09:00:00Z'),
    },
    {
      id: '2',
      referenceCode: 'SGF-261124-BBBB',
      fullName: 'Siddharth Joshi',
      mobileNumber: '9765432109',
      email: '',
      city: 'Pimpri-Chinchwad',
      requiredAmount: '₹5,00,000',
      requirementType: 'Loan Against Eligible Pledged Assets',
      preferredContact: 'WhatsApp',
      message: 'Asset evaluation inquiry',
      consentAccepted: true,
      status: 'contacted',
      remarks: 'Scheduled call',
      source: 'social_campaign',
      createdAt: new Date('2026-11-24T12:00:00Z'),
      updatedAt: new Date('2026-11-24T12:00:00Z'),
    },
  ];

  assert.equal(
    filterEnquiries(records, { search: 'meera@example.com', status: 'all', dateFrom: '', dateTo: '' }).length,
    1
  );
  assert.equal(
    filterEnquiries(records, { search: '', status: 'contacted', dateFrom: '', dateTo: '' }).length,
    1
  );
  assert.equal(
    filterEnquiries(records, { search: '', status: 'all', dateFrom: '2026-11-22', dateTo: '2026-11-25' }).length,
    1
  );
});

test('enquiriesToCsv escapes quotes and neutralizes spreadsheet formulas', () => {
  const csv = enquiriesToCsv([
    {
      id: '1',
      referenceCode: 'SGF-261124-CCCC',
      fullName: '=CMD("calc")',
      mobileNumber: '9822012345',
      email: 'client@example.com',
      city: 'Pune, MH',
      requiredAmount: '₹1,00,000',
      requirementType: 'Short-Term Financial Assistance',
      preferredContact: 'Either',
      message: 'Line with "quotes"',
      consentAccepted: true,
      status: 'new',
      remarks: '+SUM(A1:A2)',
      source: 'website_enquire',
      createdAt: new Date('2026-11-24T10:00:00.000Z'),
      updatedAt: new Date('2026-11-24T10:00:00.000Z'),
    },
  ]);

  assert.ok(csv.includes("'=CMD(\"\"calc\"\")"));
  assert.ok(csv.includes('"Pune, MH"'));
  assert.ok(csv.includes("'+SUM(A1:A2)"));
  assert.ok(csv.includes('client@example.com'));
});
