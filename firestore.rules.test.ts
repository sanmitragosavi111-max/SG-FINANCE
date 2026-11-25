import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

test('firestore.rules enforces default-deny catch-all at top', () => {
  assert.match(rulesContent, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
});

test('enquiries collection isolates PII from public reads and lists', () => {
  assert.match(rulesContent, /match \/enquiries\/\{enquiryId\}/);
  assert.match(rulesContent, /allow get: if isVerifiedUser\(\) && isValidId\(enquiryId\) && isAdmin\(\);/);
  assert.match(rulesContent, /allow list: if isBootstrapAdmin\(\);/);
});

test('enquiries create enforces Dirty Dozen guards (schema keys, Indian mobile regex, consent, initial status, server timestamps)', () => {
  assert.match(rulesContent, /data\.keys\(\)\.hasAll\(/);
  assert.match(rulesContent, /data\.keys\(\)\.hasOnly\(/);
  assert.match(rulesContent, /data\.mobileNumber\.matches\('\^\[6-9\]\[0-9\]\{9\}\$'\)/);
  assert.match(rulesContent, /!\('email' in data\) \|\| \(data\.email is string && data\.email\.size\(\) <= 120\)/);
  assert.match(rulesContent, /data\.consentAccepted == true/);
  assert.match(rulesContent, /incoming\(\)\.status == 'new'/);
  assert.match(rulesContent, /incoming\(\)\.remarks == ''/);
  assert.match(rulesContent, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesContent, /incoming\(\)\.updatedAt == request\.time/);
});

test('enquiries update preserves immutable customer PII fields and allows only status, remarks, updatedAt', () => {
  assert.match(
    rulesContent,
    /incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly\(\['status', 'remarks', 'updatedAt'\]\)/
  );
  assert.match(rulesContent, /incoming\(\)\.mobileNumber == existing\(\)\.mobileNumber/);
  assert.match(rulesContent, /!\('email' in existing\(\)\) \|\| incoming\(\)\.email == existing\(\)\.email/);
  assert.match(rulesContent, /incoming\(\)\.createdAt == existing\(\)\.createdAt/);
});

test('email verification is strictly enforced against email spoofing', () => {
  assert.match(rulesContent, /request\.auth\.token\.email_verified == true/);
});

test('all collections declared in firebase-blueprint.json have match blocks in firestore.rules', () => {
  for (const collectionPath of Object.keys(blueprint.firestore)) {
    const rootSegment = collectionPath.split('/').filter(Boolean)[0];
    assert.ok(
      rulesContent.includes(`match /${rootSegment}/`),
      `Missing rules match block for collection /${rootSegment}/`
    );
  }
});
