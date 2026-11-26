-- Demo bookings table for the BOAT marketing website.
-- Run in a Supabase project that is SEPARATE from the BOAT application database.
create table if not exists public.demo_bookings (
  id                 bigint generated always as identity primary key,
  reference          text not null unique,
  name               text not null,
  organization       text not null,
  organization_type  text not null,
  email              text not null,
  phone              text not null,
  organization_size  text not null,
  preferred_date     date not null,
  message            text,
  submitted_at       timestamptz not null default now(),
  ip                 text,
  user_agent         text,
  status             text not null default 'new'
);

-- Only the server (service role key) may read or write. No public access.
alter table public.demo_bookings enable row level security;
