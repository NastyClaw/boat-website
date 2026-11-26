import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

process.env.BOOKINGS_DIR = await mkdtemp(path.join(os.tmpdir(), 'boat-'));
delete process.env.SUPABASE_URL;
delete process.env.RESEND_API_KEY;
delete process.env.SMTP_HOST;
const { handleBooking, validateBooking } = await import('../lib/booking.js');
const { buildEmail } = await import('../lib/mailer.js');

const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const good = () => ({
  name: 'Jane Namubiru',
  organization: 'Lake View Primary School',
  organizationType: 'School',
  email: 'jane@example.com',
  phone: '+256 700 000 000',
  organizationSize: '301–800 students',
  preferredDate: future,
  message: 'Interested in fees management',
  website: '',
  startedAt: String(Date.now() - 10_000),
});

test('valid booking passes validation', () => {
  assert.equal(validateBooking(good()).ok, true);
});

test('invalid fields are reported', () => {
  const r = validateBooking({ ...good(), email: 'bad', phone: '12', organizationType: 'Bank', preferredDate: '2000-01-01' });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'organizationType', 'phone', 'preferredDate']);
});

test('honeypot submissions are silently dropped', async () => {
  const r = await handleBooking({ body: { ...good(), website: 'http://spam' }, ip: '1.1.1.1' });
  assert.equal(r.status, 200);
});

test('too-fast submissions are rejected', async () => {
  const r = await handleBooking({ body: { ...good(), startedAt: String(Date.now()) }, ip: '1.1.1.2' });
  assert.equal(r.status, 400);
});

test('valid booking is saved even when email is not configured', async () => {
  const r = await handleBooking({ body: good(), ip: '1.1.1.3' });
  assert.equal(r.status, 200);
  assert.match(r.json.reference, /^BOAT-/);
  const saved = await readFile(path.join(process.env.BOOKINGS_DIR, 'bookings.jsonl'), 'utf8');
  assert.match(saved, /Lake View Primary School/);
});

test('rate limiting kicks in', async () => {
  let last;
  for (let i = 0; i < 7; i++) last = await handleBooking({ body: good(), ip: '9.9.9.9' });
  assert.equal(last.status, 429);
});

test('email contains every booking detail and escapes HTML', () => {
  const b = { ...good(), name: '<script>x</script>', reference: 'BOAT-1', submittedAt: 'now' };
  const { html, text } = buildEmail(b);
  for (const v of [b.organization, b.organizationType, b.email, b.phone, b.organizationSize, b.preferredDate, b.message]) {
    assert.ok(text.includes(v));
  }
  assert.ok(!html.includes('<script>'));
});
