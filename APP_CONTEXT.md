# Crux Group — application context (bookings + admin / partner OS)

**Purpose:** Single reference for the current state of the product codebase: stack, architecture, data model, and business-facing capabilities. Intended for onboarding, planning, and LLM context (paste or attach this file).

**Scope:** `apps/bookings` (B2C customer app), `apps/admin` (platform **Admin** + **Partner** “Partner OS” in one Next.js app), and shared packages under `packages/`.

**Last reviewed:** 2026-05-15 (generated from repository structure and code).

---

## 1. Monorepo layout

| Path | Role |
|------|------|
| `apps/bookings` | Customer-facing bookings web app (default dev port **3000**) |
| `apps/admin` | Internal admin + partner operations (default dev port **3001**) |
| `packages/db` | Prisma schema + MongoDB client, seeds |
| `packages/api` | tRPC `appRouter` + domain services (OTP, bookings, equipment, partners, catalog, dictionary) |
| `packages/lib` | Integrations and utilities (e.g. AiSensy WhatsApp, geo, invoice helpers, Blob/PDF-related code) |
| `packages/ui` | Shared React UI (Tailwind), includes `DictionaryProvider` and shared shells/components |
| `packages/auth` | Shared NextAuth hardening (`enterpriseAuthSecurity`) |
| `packages/tailwind-config`, `packages/typescript-config`, `packages/eslint-config` | Shared tooling |

**Tooling:** `pnpm` workspaces + **Turborepo** (`turbo.json`). Root scripts: `dev`, `build`, `lint`, `check-types`, `db:*`.

---

## 2. Technical specification

### 2.1 Core stack

- **Runtime / language:** Node ≥18, **TypeScript**
- **Framework:** **Next.js 16** (App Router), **React 19**
- **Auth:** **NextAuth v5** (`next-auth@5.0.0-beta.30`) with `@auth/prisma-adapter` where applicable
- **Database:** **MongoDB** via **Prisma** (`engineType = "library"`)
- **API layer:** **tRPC** (`@repo/api`) — used from server components / server actions via `createCaller({})` (see bookings home). Not all features go through HTTP tRPC endpoints; many admin flows use colocated server actions.
- **Styling:** **Tailwind CSS v4** (`@tailwindcss/postcss`), shared tokens/config from `@repo/tailwind-config`
- **Maps:** `@react-google-maps/api`, **Leaflet** / `react-leaflet` (admin/partner map UIs)
- **Forms / validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **UI polish:** `framer-motion`, `sonner` toasts, `vaul` drawers (admin), Radix tabs (bookings)
- **Documents:** `react-markdown` + `remark-gfm` for legal and markdown content
- **PDF:** `pdf-lib` (admin + lib)

### 2.2 Architectural patterns

- **Two Next.js apps, one database:** Same Prisma models; role-specific behavior enforced in **NextAuth callbacks** + **route guards** (admin app) and session checks (bookings).
- **Edge-safe auth config:** `apps/admin/auth.config.ts` is explicitly **Prisma-free** (used from `proxy.ts` / Edge). Session enrichment (e.g. `role`, `phoneNumber`) uses JWT/session callbacks; full provider logic lives in `apps/*/lib/auth.ts`.
- **Next.js 16 “proxy” instead of middleware:** Admin app exports NextAuth from `apps/admin/proxy.ts` with a matcher that excludes static assets so `/login` branding assets are not redirected to HTML login.
- **Internationalization / copy:** `Dictionary` model in Mongo (`DictionaryApp`: `BOOKING` | `ADMIN`) + `getLabelsForApp` / per-app label loaders feeding `@repo/ui` `DictionaryProvider`.
- **Money:** Amounts in **paise** (integer): **1 INR = 100 paise** (documented in `schema.prisma`). UI may display rupees.
- **File storage:** **Vercel Blob** (`@vercel/blob`, `BLOB_READ_WRITE_TOKEN`) for uploads (KYC, machine docs, etc.).

### 2.3 External integrations (from code + `turbo.json` env hints)

- **Google OAuth:** Admin staff sign-in (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
- **WhatsApp (AiSensy):** OTP delivery, welcome note, operator links, booking confirm, partner overrun, invoice payment / overdue reminders, payslips, partner service-due alerts (`AISENSY_*` env vars).
- **Razorpay:** Payments / payment links for invoices (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- **Cron / webhooks:** Bookings app exposes e.g. `app/api/cron/invoice-payment-reminders/route.ts` (guarded; `CRON_SECRET` in turbo build env list).
- **Cross-app URLs:** `NEXT_PUBLIC_BOOKINGS_URL`, `BOOKINGS_APP_ORIGIN` — admin auth redirects plain `USER` role to the public bookings origin (e.g. `https://bookings.cruxgroup.in` in `auth.config.ts`).

---

## 3. Data model (high level)

Defined in `packages/db/prisma/schema.prisma`. Notable domains:

- **Identity:** `User` (`UserRole`: `USER` | `ADMIN` | `PARTNER`), `Account`, `Session`, `Otp` (phone OTP storage).
- **Partner profile:** `Partner` (1:1 with `User` when `role = PARTNER`) — yard info, service radius, **KYC** fields and documents, bank/GST, `kycStatus` (`PENDING` | `SUBMITTED` | `VERIFIED` | `REJECTED`).
- **Catalog & fleet:** `MasterCatalog` (platform standard types + rate guardrails), `Equipment` (partner fleet or platform-owned when `partnerId` null) with pricing, transport rules, maintenance fields, hour-meter baselines, RC URL, etc. `EquipmentCategory`: JCB, Crane, Excavator.
- **B2C booking:** `Booking` — links `User`, `Equipment`, optional `Partner`, optional CRM `Customer`; `BookingStatus`; embedded `BookingLocation`, `BookingPricingType` (total in paise, duration, unit).
- **Field execution:** `Trip` — operational lifecycle (`TripStatus`: scheduled → en route → on site → completed / overrun / cancelled / disputed); locked rates and transport fee; `operatorToken` (magic link); start/end OTPs; optional `bookingId`; reviews and invoices.
- **CRM / B2B:** `Customer`, `SavedLocation` (named sites, geo); optional link `Customer.userId` to platform user for saved sites in bookings.
- **Billing:** `Invoice` (per trip, sequential FY numbering via `InvoiceCounter`), `Payment` records, Razorpay link fields, reminder timestamps.
- **Operator payroll:** `OperatorProfile`, `PayrollEntry` (monthly, PDF URL, deductions, PF flags).
- **Maintenance:** `MachineServiceLog`, `HourMeterEntry`, `BreakdownReport`.
- **Service coverage:** `ServiceableArea` (pincodes).
- **Content:** `Dictionary` per app/language/key.

---

## 4. Shared API package (`@repo/api`)

`packages/api/src/root.ts` composes:

| Router | Responsibility |
|--------|----------------|
| `dictionary` | Label strings by app/language |
| `auth` | Auth-related mutations (as defined in router) |
| `equipment` | List/search/get/create/update equipment; partner-scoped listings |
| `booking` | `create` (B2C style input), `getAll`, `getByPartner`; `updateStatus` **throws** — status changes must use authenticated server actions in admin |
| `partner` | Partner listing / detail / mutations for partner management |
| `masterCatalog` | Master catalog listing |

Exported helpers include **`verifyOtp`**, **`sendBookingsOtpWithWhatsApp`**, **`DEV_MASTER_OTP`**, and **`getLabelsForApp`**.

---

## 5. Bookings app (`apps/bookings`)

**Audience:** End customers (construction equipment renters) in **Telangana / India** positioning (marketing copy references “largest heavy machinery fleet in Telangana”).

### 5.1 Auth & session

- **Phone OTP** via NextAuth **Credentials** (`apps/bookings/lib/auth.ts`): normalizes phone, `verifyOtp` from `@repo/api`, creates `User` with `role: USER` on first login, optional **WhatsApp welcome** template on first success.
- **Lockout:** OTP failures tracked on `User` (`otpAttempts`, `lockoutUntil`); login UI surfaces lockout messaging.
- **Dev convenience:** `NEXT_PUBLIC_NODE_ENV === "development"` can show static dev OTP (`4242`) on login page.

### 5.2 Primary routes (`app/**/page.tsx`)

| Route | Behavior |
|-------|----------|
| `/` | **Requires login** — loads equipment via `createCaller({}).equipment.list()` and renders `HomeContent` (fleet browse + booking UX). |
| `/login` | Phone → OTP flow; links to legal pages. |
| `/dashboard` | “My bookings” — active vs past tabs (`fetchMyBookingsForUser`). |
| `/profile` | Customer profile. |
| `/track/[tripId]` | Trip tracking / timeline for customers. |
| `/operator/[token]` | Operator-facing magic-link flows tied to `Trip.operatorToken`. |
| `/legal/terms-and-conditions`, `/legal/privacy-policy` | Markdown-backed legal. |

**Layout:** `force-dynamic`, Geist font, `DictionaryProvider` with `getBookingLabels`, conditional header, page transitions, Sonner toasts.

### 5.3 Notable API routes (`app/api/**`)

- `auth/[...nextauth]` — NextAuth handler
- `auth/send-otp`, `auth/verify-otp` — OTP HTTP helpers used by login actions
- `search` — equipment search
- `saved-locations` — persisted sites for customers (CRM-backed saved locations)
- `cron/invoice-payment-reminders` — scheduled invoice nudges

### 5.4 Business features (customer)

- Browse **partner/platform equipment catalog** with geo and booking constraints.
- Create **rental bookings** (hourly/daily pricing units, date range, site location) — backed by `booking.create` + Prisma `Booking` row.
- **Account dashboard** for rental history and active jobs.
- **Trip tracking** and **operator** workflows aligned with `Trip` model (status, OTPs, tokens).
- **Legal compliance** surface (T&C, privacy).

---

## 6. Admin app (`apps/admin`) — platform + Partner OS

**Single codebase, role-based UX:** `User.role` drives navigation (`AdminSidebar` / bottom nav), theming nuances (`AdminShell`), and **authorization** in `auth.config.ts` + `lib/auth.ts`.

### 6.1 Auth

- **ADMIN:** **Google** sign-in restricted to **`@cruxgroup.in`** or emails listed in `ALLOWED_ADMIN_EMAILS` (comma-separated). `signIn` callback consults Prisma for existing elevated roles.
- **PARTNER:** **Phone OTP** credentials provider (`phone-otp`) with admin-specific phone normalization rules (`lib/phone.ts`, `ADMIN_PHONE_E164`).
- **USER:** If a plain B2C user hits the admin app while logged in, they are **redirected to the bookings app origin** (see `auth.config.ts`).
- **Post-login home:** `PARTNER` → `/fleet` (also used as safe redirect when hitting forbidden admin paths); `ADMIN` → `/dashboard`.

### 6.2 Route guard summary (`auth.config.ts`)

- **Partners cannot access:** `/platform-admin/*`, `/equipment`, `/partners`, `/bookings` **except** walk-in desk under **`/bookings/new`** (and subpaths), `/settings` except **`/settings/kyc`**, and other platform-only areas.
- **Partners hitting forbidden paths** are redirected to **`/fleet`** (not dashboard).
- **Admins** are kept off partner-only surface routes (`/fleet`, `/my-bookings`, `/service-area`, `/earnings`) — redirected to **`/dashboard`**.

### 6.3 Shell & onboarding

- **`AdminShell`:** If authenticated `PARTNER` has **no** `Partner` row → force **`/onboarding`**; if onboarded and on `/onboarding` → **`/dashboard`**.
- Partners get **mobile-first** chrome (`PartnerMobileHeader`, `PartnerBottomNav`); admins get parallel admin mobile components. Desktop: shared sidebar.

### 6.4 Navigation-driven feature map

**Platform admin (`ADMIN` nav)**

- **Dashboard** — `app/dashboard/page.tsx`: non-partner view is `DashboardHome` (platform metrics / tools).
- **Partners** — `/partners`
- **KYC verification queue** — `/platform-admin/kyc`
- **Master catalog** — `/equipment`
- **Global bookings** — `/bookings` (list across partners; distinct from partner walk-in)
- **Settings** — `/settings` (admin profile / configuration; server-rendered role checks)

**Partner OS (`PARTNER` nav)**

- **Home** — `/dashboard` shows `PartnerCommandCenter` (fleet counts + cached BI via `getPartnerBusinessDashboard`).
- **Walk-in booking** — `/bookings/new` (B2B/walk-in desk; large form feature area).
- **Live job board** — `/jobs` (+ live API `app/api/jobs/live/route.ts`).
- **Inbound requests** — `/requests`
- **Fleet & health** — `/fleet`, machine health under `(dashboard)/fleet/[id]/health`, edits `fleet/[id]/edit`, add `fleet/new`
- **My bookings** — `/my-bookings` (partner-scoped booking view)
- **Payroll** — `/payroll`
- **Service area** — `/service-area`
- **Earnings** — `/earnings`
- **Settings** — `/settings/kyc` entry in nav (partner KYC / compliance)

**Additional routes present in tree**

- **Customers CRM** — `(dashboard)/customers`, `(dashboard)/customers/[id]`
- **Legal** — `/legal/partner-terms`, `/legal/privacy-policy`
- **KYC document plumbing** — `app/api/kyc/blob`, `app/api/kyc/view/[docId]` (secured viewing; `KYC_DOC_VIEW_SECRET` in turbo env list)
- **Login** — `/login` (Google + partner OTP)
- **Root** — `app/page.tsx` (entry behavior as implemented)

### 6.5 Business features (platform)

- **Partner lifecycle:** discovery, onboarding, **KYC review queue**, activation.
- **Master equipment catalog** with guardrail pricing bands.
- **Global booking oversight** across the network.
- **Operational / BI dashboards** for headquarters.

### 6.6 Business features (partner)

- **Onboarding & KYC** capture (documents stored in Blob; status workflow).
- **Fleet management:** machines, pricing, transport radius, maintenance intervals, hour-meter and service logs, breakdown reporting, health views.
- **Demand:** inbound customer requests + live jobs board for dispatch coordination.
- **Walk-in / B2B desk:** create bookings tied to CRM-style context where implemented.
- **Payroll** for operators tied to `OperatorProfile` / `PayrollEntry`.
- **Earnings** views tied to trips/invoices/payments model.
- **Service area** management aligned with partner radius + `ServiceableArea` data.

---

## 7. Cross-cutting operational story

1. **Customer** (bookings app) authenticates with phone OTP → browses **`equipment.list`** → creates **`Booking`**.
2. Platform/partner workflows promote work into **`Trip`** records (scheduling, OTP-gated start/complete, operator magic link, overrun handling).
3. Completed work generates **`Invoice`** (+ PDF), **`Payment`** via Razorpay links, WhatsApp reminders.
4. **Reviews** capture dual ratings (machine + operator).

(Exact state transitions are implemented across server actions and services; this is the conceptual spine reflected in Prisma.)

---

## 8. Conventions for contributors & LLMs

- Prefer **role-aware server actions** in admin for mutations that touch `Booking`, `Trip`, or `Equipment` ownership — do not re-enable deprecated `booking.updateStatus` over public tRPC.
- When adding **Edge** code paths, keep imports compatible with `auth.config.ts` (no `@repo/db` / Prisma).
- Respect **monetary type = Int paise** unless explicitly geo or meter readings (`Float` allowed for coordinates, km, hours).
- **Partner vs admin URL collisions:** `/bookings` is admin-global; `/bookings/new` is partner walk-in — a deliberate split enforced in middleware logic.

---

## 9. How to regenerate or extend this document

Update this file when:

- New first-class routes appear under `apps/*/app`.
- Prisma schema gains models or enum values that change product semantics.
- Auth rules in `apps/admin/auth.config.ts` / `apps/admin/lib/auth.ts` or bookings `lib/auth.ts` change.
- New third-party integrations or env vars are added to `turbo.json` / deployment.

For deep implementation detail, grep from the paths cited above rather than duplicating every server action name here.
