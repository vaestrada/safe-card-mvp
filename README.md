# Safe Card MVP — Iteration 01

Digital referral and application-intake pilot for the Philippine Red Cross
Safe Card program. Mobile-first, five-epic MVP, 5-business-day sprint.

**VibeCodersPH · Aug 2026 · Tech Lead: Viron Gil Estrada**

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4
- Supabase (Postgres) for live mode; local JSONL for synthetic mode
- Vercel for deployment

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build check
```

**Synthetic mode (default):** with no `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
in `.env.local`, submissions and referrals append to `data/*.jsonl` locally.
This is the pilot guardrail: no real applicant data is collected until the
privacy/consent protocol is approved and the project-owned Supabase instance
is provisioned.

**Live mode:** fill `.env.local` from `.env.example` (service role key, server
only), then apply the schema:

```bash
supabase db push        # or run supabase/migrations/0001_init.sql in SQL editor
```

## Epics

| Epic | Capability | Where |
|---|---|---|
| 1 | Landing page | `app/page.tsx` |
| 2 | Benefit storyboard | `app/storyboard/page.tsx` |
| 3 | Referral QR & link | `app/r/[code]/route.ts` + `app/api/qr/[code]/route.ts` |
| 4 | Application-intake form | `components/ApplyForm.tsx` + `app/apply/page.tsx` |
| 5 | Pilot data store | `lib/store.ts` + `app/api/apply/route.ts` + `supabase/migrations/0001_init.sql` |

## Definition of Ready (before Day 1)

- [ ] Signed proposal / service agreement
- [ ] PRC-approved content: price, benefits, eligibility, application fields, wording
- [ ] Approved privacy notice / consent language
- [ ] Project-owned GitHub / Vercel / Supabase accounts with team invitations
- [ ] Supabase region decision (recommend ap-southeast-1) + domain decision
- [ ] Day 3 UAT participants and Day 5 validation users confirmed

## Data privacy (RA 10173)

- RLS: deny all direct access; writes go through the server only (service role)
- PIC/PIP roles confirmed before real data is processed
- Consent checkpoint required before submission
- Synthetic/test data until privacy protocol is approved
- `data/` is git-ignored; never commit submissions

## Open blockers (commercial, tracked with the BA)

1. Billing entity / invoice-ability for the ₱70,000 fee
2. Signature blocks must be blank until terms are final
3. Define release-blocking defect severity + tranche-2 payment trigger
