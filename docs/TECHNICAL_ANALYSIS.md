# Safe Card MVP — Technical Analysis & Roadmap

A comprehensive study of the `safe-card-mvp` codebase (Philippine Red Cross Safe Card digital intake pilot), identifying architectural strengths, gaps, recommended improvements, and proposed specialized AI sub-agents/skills.

---

## 1. System Overview & Architecture Study

The project is built on **Next.js 16 (App Router)** + **React 19** + **TypeScript** + **Tailwind CSS v4** + **Supabase (Postgres)**, designed for rapid field deployment in a 5-business-day sprint.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Viewports                              │
│  ├─ Landing Page (app/page.tsx)                                         │
│  ├─ Benefit Storyboard (app/storyboard/page.tsx)                        │
│  ├─ Field QR Poster (app/qr/[code]/page.tsx)                            │
│  └─ Application Form (app/apply/page.tsx + components/ApplyForm.tsx)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP (App Router / Route Handlers)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Next.js Server / API Routes                      │
│  ├─ /r/[code]          --> Referral click tracking + cookie setting     │
│  ├─ /api/qr/[code]     --> QR code SVG generator                         │
│  ├─ /api/apply         --> Application intake endpoint (Honeypot + validation)│
│  └─ /admin             --> Admin portal & CSV export                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Server-Side Storage Execution
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Dual-Storage Engine                            │
│                             (lib/store.ts)                              │
│          ┌─────────────────────────┴─────────────────────────┐          │
│          ▼                                                   ▼          │
│   Live Mode: Supabase                            Synthetic Mode         │
│   Postgres RLS (Service Role)                    Local JSONL (data/*.jsonl)│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Strengths & Clever Patterns

1. **Dual Storage Engine (`lib/store.ts`)**: Fallback to local `.jsonl` files when Supabase environment variables are missing ensures zero beneficiary data loss during local development, demo sessions, or offline offline field testing.
2. **Honeypot & Security Defenses**: The application form embeds hidden honeypot fields (`hp_email`) to trap automated spam without requiring heavy CAPTCHA UI overhead for low-bandwidth field users.
3. **Admin Cookie Constant-Time Comparison (`lib/admin.ts`)**: Protection against timing attacks when validating admin credentials.
4. **Ambassador Assist Mode**: Captures whether the form is filled directly by the applicant or via a Red Cross volunteer/ambassador, enabling auditability for assisted field sign-ups.

---

## 3. Critical Findings & Areas for Improvement

### A. Data Integrity & Validation Gaps
* **Dynamic Record Storage in Supabase**: In `lib/store.ts`, `fields` is stored as a generic `jsonb` column. While flexible for MVP iterations, strict schema validation (using Pydantic / Zod) is missing on the server route to reject malformed payloads.
* **No Offline Queueing / PWA Capabilities**: If field advocates lose internet connection in remote barangays, `components/ApplyForm.tsx` currently fails on network submission. Adding IndexedDB local queueing + Service Worker background sync would solve offline field operations.

### B. Security & Compliance (RA 10173 / Data Privacy)
* **Admin Authentication Expiry & Session Invalidation**: The current admin auth relies on a simple hashed cookie. Implementing token rotation or real Supabase Auth for `/admin` will be necessary once moving beyond MVP.
* **Audit Trail**: Referral codes and applicant timestamps are saved, but field ambassador IP/device fingerprints are not hashed or tracked for fraud prevention in referral reward programs.

### C. Developer Experience & Test Coverage
* **Unit Testing**: While Playwright (`e2e/smoke.spec.ts`) covers high-level smoke paths, unit test coverage (via Vitest) for core utilities (`lib/store.ts`, `lib/admin.ts`, QR generators) is absent.

---

## 4. Recommended Roadmap

1. **Phase 1: Validation & Offline Resilience (Immediate)**
   - Add Zod validation schemas for all application intake inputs (`components/ApplyForm.tsx`, `app/api/apply/route.ts`).
   - Implement local storage / IndexedDB form state preservation for field users with unstable network connections.

2. **Phase 2: Admin Operations & Analytics**
   - Add dashboard visualizations (referral conversion rates per advocate, daily intake counts).
   - Add batch status updates (e.g., `submitted` -> `verified` -> `approved`) in `/admin`.

3. **Phase 3: Production Readiness & Compliance**
   - Migrate admin access from simple env-based cookies to full Supabase Auth with RBAC (Role-Based Access Control).
   - Add PDF application generator for printable physical archive output.

---

## 5. Proposed Sub-Agents & Custom Skills

To accelerate development while maintaining clean engineering, the following specialized AI sub-agents and skills are recommended for this repository:

### A. Recommended Sub-Agents

1. **`prc-compliance-agent`**
   - **Focus**: Data Privacy Act of 2012 (RA 10173) compliance, consent wording verification, PII redaction checks, and Supabase RLS policy auditing.
2. **`field-ux-agent`**
   - **Focus**: Mobile-first UI/UX auditing (ensuring high touch-target sizes, low assets/payload size for 3G field connections, offline form state resilience).
3. **`qa-stress-agent`**
   - **Focus**: Playwright E2E scenario generation, edge-case form testing, honeypot validation, and load testing referral endpoints.

### B. Recommended Custom Skills

1. **`zod-intake-schema`**
   - **Description**: Generates and syncs Zod validation schemas across `components/ApplyForm.tsx`, Next.js route handlers, and Supabase TypeScript definitions.
2. **`offline-field-sync`**
   - **Description**: Implements client-side local storage queueing and background sync mechanisms for field applications submitted without internet connection.
3. **`advocate-qr-exporter`**
   - **Description**: Generates high-resolution printable PDF posters embedding advocate QR codes for physical distribution in field operations.

---

*Analysis generated on 2026-08-28.*
