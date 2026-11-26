import { handleBooking } from '../lib/booking.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  try {
    const { status, json } = await handleBooking({ body, ip, userAgent: req.headers['user-agent'] });
    return res.status(status).json(json);
  } catch (err) {
    console.error('[book-demo]', err);
    return res.status(500).json({ ok: false, message: 'Something went wrong. Please try again shortly.' });
  }
}
