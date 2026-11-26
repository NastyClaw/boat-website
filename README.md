# BOAT Marketing Website

Standalone public-facing marketing website for **BOAT (Business Operations Automation Technologies)**, built completely separate from the existing BOAT web application (`https://boat-frontend.vercel.app/?page=dashboard`).

## Running Locally

```bash
npm install
cp .env.example .env
# Edit .env with your private BOAT_ADMIN_EMAIL and Resend/SMTP + Supabase credentials
npm run dev
```

Open `http://localhost:3000`.

## Running Automated Tests

```bash
npm test
```

## Administrator Email & Booking Persistence

To keep the BOAT administrator's private email address completely hidden from website visitors and source control:

1. **Never put the private admin email in `public/`**. Only configure `BOAT_ADMIN_EMAIL` in `.env` (local/VPS) or Vercel Project Environment Variables.
2. **Email delivery** (`lib/mailer.js`):
   - **Option A (Recommended on Vercel):** Set `RESEND_API_KEY` and `MAIL_FROM`.
   - **Option B (Any SMTP server):** Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`.
3. **Booking storage** (`lib/storage.js`):
   - **Production (Supabase):** Run [`supabase/demo_bookings.sql`](./supabase/demo_bookings.sql) in a dedicated Supabase project (separate from the BOAT app database) and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Row-Level Security is enabled with no public policies so only the server can access bookings.
   - **Local / VPS fallback:** Appends JSON Lines records to `data/bookings.jsonl` (gitignored).

## Optional Public Contact Details

When you are ready to publish a public phone number, WhatsApp number, public enquiries email, or physical office address in the footer, fill them into [`public/site-config.js`](./public/site-config.js). Empty fields remain hidden so no placeholder credentials appear on the live site.

## Deploying to Vercel

Deploy this directory as its **own separate Vercel project** so the existing `boat-frontend` deployment is untouched:

1. Import this repository/folder in Vercel.
2. Add environment variables (`BOAT_ADMIN_EMAIL`, `MAIL_FROM`, `RESEND_API_KEY` or `SMTP_*`, and `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
3. Deploy — `public/` is served statically and `api/book-demo.js` runs as a serverless function.
