<div align="center">

# 💳 Safe Card MVP

**Digital referral and application-intake pilot for the Philippine Red Cross Safe Card program**

[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)

</div>

Safe Card MVP is a mobile-first digital referral and application-intake pilot designed for the Philippine Red Cross (PRC) Safe Card program. Built for rapid field deployment, it enables advocates to generate dynamic referral links and printable QR codes, guides applicants through a benefit storyboard, collects privacy-compliant intake applications, and gives program admins real-time intake tracking with CSV export capabilities.

---

## Why it exists: offline field referrals need digital velocity

The Philippine Red Cross Safe Card program relies heavily on field advocates, volunteers, and community leaders to reach beneficiaries. Physical paper forms create delays, tracking gaps, and manual data-entry overhead. 

This pilot bridges field advocacy and digital intake: advocates get custom QR posters and links to track their referral funnels, applicants view interactive benefit storyboards, and intake submissions route safely into a privacy-compliant data store—complete with a local synthetic JSONL fallback for offline testing or pre-consent environments.

| Problem | Solution | Result |
|---|---|---|
| Paper intake is slow and prone to loss | Mobile-first Next.js 16 application form (`/apply`) | Instant digital intake with validation |
| Hard to track volunteer referral impact | Dynamic referral routing (`/r/[code]`) + QR poster engine (`/qr/[code]`) | Transparent per-advocate conversion tracking |
| Beneficiaries need clear benefit context | Interactive benefit storyboard (`/storyboard`) | Higher completion rates through visual context |
| Data privacy compliance before provisioning | Dual-mode storage engine: local synthetic JSONL or Postgres RLS | Zero real beneficiary data collected until consent approved |
| Manual admin reporting | Password-gated admin portal (`/admin`) with CSV export | One-click handoff for PRC program managers |

## Architecture

```
┌─────────────────┐    ┌───────────────────────────┐    ┌──────────────────┐
│ Field Advocate  │───▶│ Referral Link / QR Poster │───▶│ Beneficiary      │
│ (Community)     │    │ (/r/[code], /qr/[code])   │    │ (Landing Page)   │
└─────────────────┘    └───────────────────────────┘    └────────┬─────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐    ┌───────────────────────────┐    ┌──────────────────┐
│ PRC Admin       │◀───│ Application Intake        │◀───│ Benefit          │
│ (/admin Portal) │    │ (/apply, ApplyForm)       │    │ Storyboard       │
└────────┬────────┘    └─────────────┬─────────────┘    └──────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐    ┌───────────────────────────┐
│ CSV Export      │◀───│ Dual Storage Engine       │
│ (PRC Handoff)   │    │ (lib/store.ts)            │
└─────────────────┘    │ ├─ Local JSONL (Synthetic)│
                       │ └─ Supabase Postgres (RLS)│
                       └───────────────────────────┘
```

Pipeline flow:
1. **Referral & Attribution** — Advocates share a QR poster or direct link (`/r/[code]`). The route logs referral context in session cookies and redirects to the landing page.
2. **Onboarding & Storyboard** — Beneficiaries explore program coverage and benefit tiers (`/storyboard`) before entering the application flow.
3. **Application Intake & Validation** — Applicants (or ambassador helpers in assist mode) submit details via `/apply`. Form validation, honeypot spam protection, and consent checkpoints run server-side.
4. **Dual-Mode Persistence** — `lib/store.ts` routes submissions to local `data/*.jsonl` files (synthetic guardrail) when Supabase credentials are absent, or directly to Supabase Postgres (with strict server-side service role execution) when live mode is active.
5. **Admin Operations & Handoff** — Program admins authenticate at `/admin` to view live submission metrics, referral funnels, and export aggregated data as CSV for PRC operational processing.

## Epics & Capabilities

| Epic | Capability | Implementation Path |
|---|---|---|
| 1 | Landing Page | `app/page.tsx` |
| 2 | Benefit Storyboard | `app/storyboard/page.tsx` |
| 3 | Referral QR & Link Engine | `app/r/[code]/route.ts`, `app/api/qr/[code]/route.ts` |
| 4 | Application Intake Form | `components/ApplyForm.tsx`, `app/apply/page.tsx` |
| 5 | Pilot Data Store & Admin | `lib/store.ts`, `app/api/apply/route.ts`, `app/admin/page.tsx`, `supabase/migrations/0001_init.sql` |

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Setup

```bash
# Clone and enter directory
cd /Users/kerwinarlan/github/safe-card-mvp

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Modes

- **Synthetic Mode (Default):** Without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` configured in `.env.local`, applications save to local `data/*.jsonl` files. No network calls or database dependencies required.
- **Live Supabase Mode:** Copy `.env.example` to `.env.local` and add your project credentials. Apply database migrations:

```bash
supabase db push
```

> **Note on Supabase API Keys:** PostgREST requires legacy `anon` / `service_role` keys on this environment. Obtain legacy keys via `supabase projects api-keys --project-ref <ref> --output json`.

## Testing & Quality Assurance

Playwright E2E smoke tests verify critical user paths across Desktop Chromium and Mobile Pixel 5 viewports:

```bash
# Run Playwright E2E tests
pnpm test:e2e
```

The test suite validates landing page rendering, referral redirects, form validation, honeypot spam defense, ambassador assist mode, and admin authentication.

## Data Privacy & Compliance (RA 10173)

- **Strict Row-Level Security (RLS):** Database policies deny direct public access; all writes execute via server-side service role APIs.
- **Consent Protocol:** Explicit user consent checkpoint required before application submission.
- **Synthetic Guardrail:** `data/` local files are git-ignored to prevent accidental commits of test or field data.

---

<div align="center">
  <sub>Built by <b>VibeCodersPH</b> for the Philippine Red Cross Safe Card Pilot</sub>
</div>
