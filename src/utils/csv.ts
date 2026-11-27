import type { EnquiryRecord } from '../types/site.ts';

function escapeCsvCell(raw: string): string {
  const trimmed = raw ?? '';
  // Guard against spreadsheet formula injection when exported to Excel / Google Sheets
  const formulaSafe = /^[=+\-@\t\r]/.test(trimmed) ? `'${trimmed}` : trimmed;
  if (/[",\n\r]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }
  return formulaSafe;
}

export function enquiriesToCsv(enquiries: EnquiryRecord[]): string {
  const headers = [
    'Reference Code',
    'Submitted At',
    'Full Name',
    'Mobile Number',
    'Email',
    'City',
    'Required Loan Amount',
    'Financial Requirement',
    'Preferred Contact',
    'Status',
    'Email Notification',
    'Source',
    'Customer Message',
    'Follow-up Remarks',
  ];

  const rows = enquiries.map((item) => [
    item.referenceCode,
    item.createdAt ? item.createdAt.toISOString() : '',
    item.fullName,
    item.mobileNumber,
    item.email || '',
    item.city,
    item.requiredAmount,
    item.requirementType,
    item.preferredContact,
    item.status,
    item.emailNotificationStatus ?? 'pending',
    item.source,
    item.message,
    item.remarks,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(','))
    .join('\r\n');
}
