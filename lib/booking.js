// Shared demo-booking handler used by server.js (local/self-hosted) and api/book-demo.js (Vercel).
// The administrator's address is read ONLY from process.env.BOAT_ADMIN_EMAIL on the server
// and is never sent to the browser.

import { saveBooking } from './storage.js';
import { sendAdminNotification } from './mailer.js';

export const ORG_TYPES = [
  'Small business',
  'Medium-sized business',
  'Large organization',
  'School',
];

export const ORG_SIZES = [
  '1–10 people',
  '11–50 people',
  '51–200 people',
  '201+ people',
  'Up to 300 students',
  '301–800 students',
  '801–1,500 students',
  '1,501+ students',
];

const MIN_FILL_MS = 3000; // humans need more than 3s to complete the form
const MAX_FILL_MS = 1000 * 60 * 60 * 24; // stale forms (24h) must be reloaded
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const hits = new Map();

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // strip control characters (keep newlines for the message) and trim
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim().slice(0, max + 1);
}

function isRateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return list.length > RATE_LIMIT.max;
}

function todayISO(offsetDays = 0) {
  // Dates are compared in East Africa Time (UTC+3), where BOAT operates.
  const d = new Date(Date.now() + 3 * 3600 * 1000 + offsetDays * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

export function validateBooking(body) {
  const errors = {};
  const data = {
    name: clean(body.name, 100),
    organization: clean(body.organization, 150),
    organizationType: clean(body.organizationType, 60),
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 25),
    organizationSize: clean(body.organizationSize, 60),
    preferredDate: clean(body.preferredDate, 10),
    message: clean(body.message, 2000),
  };

  if (data.name.length < 2 || data.name.length > 100) errors.name = 'Please enter your full name.';
  if (data.organization.length < 2 || data.organization.length > 150)
    errors.organization = 'Please enter your organization’s name.';
  if (!ORG_TYPES.includes(data.organizationType)) errors.organizationType = 'Please choose an organization type.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) || data.email.length > 254)
    errors.email = 'Please enter a valid email address.';
  const digits = data.phone.replace(/\D/g, '');
  if (!/^[+\d\s().-]+$/.test(data.phone) || digits.length < 9 || digits.length > 15)
    errors.phone = 'Please enter a valid phone number, e.g. +256 7XX XXX XXX.';
  if (!ORG_SIZES.includes(data.organizationSize)) errors.organizationSize = 'Please choose your organization size.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.preferredDate) || Number.isNaN(Date.parse(data.preferredDate))) {
    errors.preferredDate = 'Please choose a preferred demo date.';
  } else if (data.preferredDate < todayISO(0)) {
    errors.preferredDate = 'Please choose today or a future date.';
  } else if (data.preferredDate > todayISO(365)) {
    errors.preferredDate = 'Please choose a date within the next 12 months.';
  }
  if (data.message.length > 2000) errors.message = 'Please keep your message under 2,000 characters.';
  if ((data.message.match(/https?:\/\//gi) || []).length > 2)
    errors.message = 'Please remove links from your message.';

  return { ok: Object.keys(errors).length === 0, errors, data };
}

/**
 * @param {{ body: any, ip: string, userAgent?: string }} input
 * @returns {Promise<{ status: number, json: object }>}
 */
export async function handleBooking({ body, ip, userAgent = '' }) {
  if (!body || typeof body !== 'object') {
    return { status: 400, json: { ok: false, message: 'Invalid request.' } };
  }

  // Spam protection 1: honeypot. Bots fill hidden fields; respond as if successful and drop.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return { status: 200, json: { ok: true, reference: 'BOAT-' + Date.now().toString(36).toUpperCase() } };
  }

  // Spam protection 2: time trap.
  const started = Number(body.startedAt);
  const elapsed = Date.now() - started;
  if (!Number.isFinite(started) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return {
      status: 400,
      json: { ok: false, message: 'Please take a moment to review your details and submit again.' },
    };
  }

  // Spam protection 3: per-IP rate limiting.
  if (isRateLimited(ip || 'unknown')) {
    return {
      status: 429,
      json: { ok: false, message: 'Too many requests. Please wait a few minutes and try again.' },
    };
  }

  const { ok, errors, data } = validateBooking(body);
  if (!ok) {
    return { status: 422, json: { ok: false, message: 'Please correct the highlighted fields.', errors } };
  }

  const booking = {
    reference: 'BOAT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    ...data,
    submittedAt: new Date().toISOString(),
    ip: ip || null,
    userAgent: String(userAgent).slice(0, 300),
  };

  const [saved, mailed] = await Promise.allSettled([saveBooking(booking), sendAdminNotification(booking)]);
  const savedOk = saved.status === 'fulfilled' && saved.value?.ok;
  const mailedOk = mailed.status === 'fulfilled' && mailed.value?.ok;

  if (!savedOk) console.error('[booking] storage failed:', saved.reason || saved.value);
  if (!mailedOk) console.error('[booking] admin email failed:', mailed.reason || mailed.value);

  if (!savedOk && !mailedOk) {
    return {
      status: 502,
      json: {
        ok: false,
        message: 'We could not record your booking right now. Please try again in a few minutes.',
      },
    };
  }

  return { status: 200, json: { ok: true, reference: booking.reference } };
}
