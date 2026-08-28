-- Safe Card MVP — Iteration 01 pilot schema
-- Run: supabase db push  (or apply via SQL editor)
-- All tables RLS-protected: public anon has NO direct access.
-- All writes go through the Next.js server (service role) only.

create extension if not exists "pgcrypto";

-- Pilot advocates (people handing out referral QR/link)
create table if not exists public.advocates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,          -- e.g. 'indy-paragas'
  full_name text not null,
  org text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Referral landings (measurement)
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  advocate_code text not null,
  source text not null check (source in ('qr', 'link')),
  path text,
  created_at timestamptz not null default now()
);

-- Application intake (PII lives here; deny-all RLS)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  referral_code text,
  fields jsonb not null,              -- applicant-entered data (PRC-approved fields only)
  consent_at timestamptz not null,    -- consent checkbox timestamp
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

-- Measurement view: referral -> submission funnel
create or replace view public.referral_funnel as
select
  r.advocate_code,
  count(distinct r.id) as landings,
  count(distinct a.id) filter (where a.referral_code = r.advocate_code) as submissions
from public.referrals r
left join public.applications a on a.referral_code = r.advocate_code
group by r.advocate_code;

-- RLS: deny all direct access; server (service role) bypasses RLS
alter table public.advocates enable row level security;
alter table public.referrals enable row level security;
alter table public.applications enable row level security;

create policy "no direct access" on public.advocates for all using (false);
create policy "no direct access" on public.referrals for all using (false);
create policy "no direct access" on public.applications for all using (false);

-- Seed pilot advocates (update names after client confirms pilot roster)
insert into public.advocates (code, full_name, org)
values
  ('indy-paragas', 'Indy Paragas', 'Pilot Advocate'),
  ('eric-paragas', 'Eric Paragas', 'Pilot Advocate')
on conflict (code) do nothing;
