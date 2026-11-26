// Admin notification email. The recipient is read from process.env.BOAT_ADMIN_EMAIL only.
// Provider order: Resend (RESEND_API_KEY) → SMTP (SMTP_HOST...) → not configured.

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function buildEmail(b) {
  const rows = [
    ['Reference', b.reference],
    ['Name', b.name],
    ['Organization', b.organization],
    ['Organization type', b.organizationType],
    ['Organization size', b.organizationSize],
    ['Email', b.email],
    ['Phone', b.phone],
    ['Preferred demo date', b.preferredDate],
    ['Message', b.message || '—'],
    ['Submitted (UTC)', b.submittedAt],
  ];
  const subject = `New BOAT demo booking — ${b.organization} (${b.organizationType})`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#020617;color:#f8fafc;padding:20px 24px;font-size:18px;font-weight:bold">New demo booking</td></tr>
<tr><td style="padding:8px 24px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:42%;vertical-align:top">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;white-space:pre-wrap;vertical-align:top">${esc(v)}</td></tr>`
  )
  .join('')}
</table>
<p style="font-size:12px;color:#64748b;margin:16px 0 0">Reply to this email to respond directly to ${esc(b.name)}.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export async function sendAdminNotification(booking) {
  const to = process.env.BOAT_ADMIN_EMAIL;
  if (!to) return { ok: false, error: 'BOAT_ADMIN_EMAIL is not configured' };
  const from = process.env.MAIL_FROM || 'BOAT Website <onboarding@resend.dev>';
  const { subject, text, html } = buildEmail(booking);

  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: booking.email, subject, text, html }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
    return { ok: true, provider: 'resend' };
  }

  if (process.env.SMTP_HOST) {
    const { default: nodemailer } = await import('nodemailer');
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from, to, replyTo: booking.email, subject, text, html });
    return { ok: true, provider: 'smtp' };
  }

  return { ok: false, error: 'No email provider configured (set RESEND_API_KEY or SMTP_HOST)' };
}
