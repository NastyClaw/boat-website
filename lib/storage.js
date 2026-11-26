import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Production: set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and create the table in
// supabase/demo_bookings.sql. Use a SEPARATE project (or schema) from the BOAT app so the
// marketing site can never affect application data.
// Fallback: append to data/bookings.jsonl (on Vercel this is /tmp and is NOT persistent).

export async function saveBooking(booking) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/demo_bookings`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        reference: booking.reference,
        name: booking.name,
        organization: booking.organization,
        organization_type: booking.organizationType,
        email: booking.email,
        phone: booking.phone,
        organization_size: booking.organizationSize,
        preferred_date: booking.preferredDate,
        message: booking.message || null,
        submitted_at: booking.submittedAt,
        ip: booking.ip,
        user_agent: booking.userAgent,
      }),
    });
    if (!res.ok) return { ok: false, error: `Supabase ${res.status}: ${await res.text()}` };
    return { ok: true, store: 'supabase' };
  }

  const dir = process.env.BOOKINGS_DIR || (process.env.VERCEL ? '/tmp' : path.resolve('data'));
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, 'bookings.jsonl'), JSON.stringify(booking) + '\n', 'utf8');
  return { ok: true, store: 'file' };
}
