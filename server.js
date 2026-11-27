import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try { process.loadEnvFile?.('.env'); } catch { /* no .env file — rely on real env vars */ }

const { handleBooking } = await import('./lib/booking.js');

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.woff2': 'font/woff2',
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY, ...headers });
  res.end(body);
}

async function readJson(req, limit = 20_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Payload too large'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/book-demo') {
    const json = (s, o) => send(res, s, JSON.stringify(o), { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    if (req.method !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' });
    let body;
    try { body = await readJson(req); } catch (e) { return json(e.status || 400, { ok: false, message: 'Invalid request.' }); }
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    try {
      const { status, json: out } = await handleBooking({ body, ip, userAgent: req.headers['user-agent'] });
      return json(status, out);
    } catch (err) {
      console.error('[book-demo]', err);
      return json(500, { ok: false, message: 'Something went wrong. Please try again shortly.' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden');
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(ROOT, '404.html');
  }
  try {
    const data = await readFile(file);
    const ext = path.extname(file);
    send(res, file.endsWith('404.html') && url.pathname !== '/404.html' ? 404 : 200, data, {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
  } catch {
    send(res, 404, 'Not found');
  }
});

server.listen(PORT, () => console.log(`BOAT marketing site running on http://localhost:${PORT}`));
