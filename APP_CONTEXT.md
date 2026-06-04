# Crux Group — application context (bookings + admin / partner OS + marketing web)

**Purpose:** Single reference for the current state of the product codebase: stack, architecture, data model, and business-facing capabilities. Intended for onboarding, planning, and LLM context (paste or attach this file).

**Scope:** `apps/bookings` (B2C customer app), `apps/admin` (platform **Admin** + **Partner** “Partner OS” in one Next.js app), `apps/web` (public marketing site + blog), and shared packages under `packages/`.

**Last reviewed:** 2026-06-04 (generated from repository structure and code).

---

## 1. Monorepo layout

| Path | Role |
|------|------|
| `apps/bookings` | Customer-facing bookings web app (default dev port **3000**) |
| `apps/admin` | Internal admin + partner operations (default dev port **3001**) |
| `apps/web` | Public marketing website `www.cruxgroup.in` (default dev port **3002**); bilingual EN/TE |
| `packages/db` | Prisma schema + MongoDB client, seeds |
| `packages/api` | tRPC `appRouter` + domain services (OTP, bookings, equipment, partners, catalog, dictionary) |
| `packages/lib` | Integrations and utilities (e.g. AiSensy WhatsApp, geo/distance, invoice helpers, Blob/PDF-related code) |
| `packages/ui` | Shared React UI (Tailwind), includes `DictionaryProvider` and shared shells/components |
| `packages/auth` | Shared NextAuth hardening (`enterpriseAuthSecurity`) |
| `packages/tailwind-config`, `packages/typescript-config`, `packages/eslint-config` | Shared tooling |

**Tooling:** `pnpm` workspaces + **Turborepo** (`turbo.json`). Root scripts: `dev`, `build`, `lint`, `check-types`, `db:*`.

**Deep-dive for marketing app only:** `apps/web/WEB_APP_OVERVIEW.md`.

---

## 2. Technical specification

### 2.1 Core stack

- **Runtime / language:** Node ≥18, **TypeScript**
- **Framework:** **Next.js 16** (App Router), **React 19**
- **Auth:** **NextAuth v5** (`next-auth@5.0.0-beta.30`) with `@auth/prisma-adapter` where applicable
- **Database:** **MongoDB** via **Prisma** (`engineType = "library"`)
- **API layer:** **tRPC** (`@repo/api`) — used from server components / server actions via `createCaller({})` (see bookings home). Not all features go through HTTP tRPC endpoints; many admin flows use colocated server actions.
- **Client state (bookings):** **Zustand** with `persist` for user job-site location (`apps/bookings/app/stores/location-store.ts`)
- **Styling:** **Tailwind CSS v4** (`@tailwindcss/postcss`), shared tokens/config from `@repo/tailwind-config`
- **Maps (bookings):** Pluggable provider via `NEXT_PUBLIC_MAPS_PROVIDER`:
  - **`osm` (default):** Leaflet + OpenStreetMap tiles + **Nominatim** search/reverse (`nominatim-client.ts`; throttled User-Agent per OSM policy)
  - **`google`:** `@react-google-maps/api` + Places Autocomplete + Geocoder (`site-address-picker-google.tsx`, `location-header.tsx`)
  - Facade: `site-address-picker.tsx` → OSM or Google implementation; config in `maps-config.ts`
- **Maps (admin partner service area):** **Google Maps** (`service-area-map.tsx` under `app/partners/features/` and partner `/service-area`); requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Maps (admin misc):** Leaflet/Nominatim still used in some admin pickers (e.g. `components/location-picker.tsx`)
- **Forms / validation:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **UI polish:** `framer-motion`, `sonner` toasts, `vaul` drawers (admin + bookings location search), Radix tabs (bookings)
- **Documents:** `react-markdown` + `remark-gfm` for legal and markdown content
- **PDF:** `pdf-lib` (admin + lib)

### 2.2 Architectural patterns

- **Three Next.js apps, one database:** Same Prisma models; role-specific behavior enforced in **NextAuth callbacks** + **route guards** (admin app) and session checks (bookings).
- **Edge-safe auth config:** `apps/admin/auth.config.ts` is explicitly **Prisma-free** (used from `proxy.ts` / Edge). Session enrichment (e.g. `role`, `phoneNumber`) uses JWT/session callbacks; full provider logic lives in `apps/*/lib/auth.ts`.
- **Next.js 16 “proxy” instead of middleware:** Admin app exports NextAuth from `apps/admin/proxy.ts` with a matcher that excludes static assets so `/login` branding assets are not redirected to HTML login.
- **Internationalization / copy:**
  - **Bookings + admin:** `Dictionary` model (`DictionaryApp`: `BOOKING` | `ADMIN` | `WEB`) + `getLabelsForApp` feeding `@repo/ui` `DictionaryProvider`
  - **Marketing web:** Custom locale routing (`en` / `te`) under `apps/web/app/[locale]/…`; bilingual `_en` / `_te` fields on CMS blocks (not Dictionary-driven for page copy)
- **Money:** Amounts in **paise** (integer): **1 INR = 100 paise** (documented in `schema.prisma`). UI may display rupees.
- **File storage:** **Vercel Blob** (`@vercel/blob`, `BLOB_READ_WRITE_TOKEN`) for uploads (KYC, machine docs, etc.).
- **Marketing content:** Prisma-backed **Website CMS** (`SiteConfig`, `SiteSection`, `SiteBlock`, `BlogPost`) edited in admin; consumed by `apps/web` via `lib/content.ts` (ISR `revalidate = 3600` on homepage).

### 2.3 External integrations (from code + `turbo.json` env hints)

- **Google OAuth:** Admin staff sign-in (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
- **Google Maps Platform:** Optional in bookings (`NEXT_PUBLIC_MAPS_PROVIDER=google`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`); required for admin partner service-area UI.
- **WhatsApp (AiSensy):** OTP delivery, welcome note, operator links, booking confirm, partner overrun, invoice payment / overdue reminders, payslips, partner service-due alerts (`AISENSY_*` env vars).
- **Razorpay:** Payments / payment links for invoices (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- **Cron / webhooks:** Bookings app exposes e.g. `app/api/cron/invoice-payment-reminders/route.ts` (guarded; `CRON_SECRET` in turbo build env list).
- **Cross-app URLs:**
  - `NEXT_PUBLIC_BOOKINGS_URL`, `BOOKINGS_APP_ORIGIN` — admin auth redirects plain `USER` role to the public bookings origin (e.g. `https://bookings.cruxgroup.in` in `auth.config.ts`)
  - `NEXT_PUBLIC_ADMIN_URL` — partner/admin CTAs on marketing site
  - `NEXT_PUBLIC_SITE_URL` — canonical marketing origin (`apps/web/lib/env.ts`)
  - `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_EMAIL` — contact surfaced on web (not hardcoded in components)

---

## 3. Data model (high level)

Defined in `packages/db/prisma/schema.prisma`. Notable domains:

- **Identity:** `User` (`UserRole`: `USER` | `ADMIN` | `PARTNER`), optional B2C `companyName`, `Account`, `Session`, `Otp` (phone OTP storage), OTP lockout fields (`otpAttempts`, `lockoutUntil`), `welcomeNoteSentAt`.
- **Partner profile:** `Partner` (1:1 with `User` when `role = PARTNER`) — yard info, service radius (`maxServiceRadius` / `maxServiceRadiusKm`, `baseLocation`, `baseCoordinates`), **KYC** fields and documents, bank/GST, `kycStatus` (`PENDING` | `SUBMITTED` | `VERIFIED` | `REJECTED`).
- **Catalog & fleet:** `MasterCatalog` (platform standard types + rate guardrails), `Equipment` (partner fleet or platform-owned when `partnerId` null) with pricing, transport rules (`freeRadiusKm`, `maxRadiusKm`), maintenance fields, hour-meter baselines, RC URL, etc. `EquipmentCategory` enum in DB: **JCB, Crane, Excavator** (bookings UI may show extra filter chips e.g. Dozer/Agriculture for future catalog rows).
- **B2C booking:** `Booking` — links `User`, `Equipment`, optional `Partner`, optional CRM `Customer`; `BookingStatus`; embedded `BookingLocation`, `BookingPricingType` (total in paise, duration, unit).
- **Field execution:** `Trip` — operational lifecycle (`TripStatus`: scheduled → en route → on site → completed / overrun / cancelled / disputed); locked rates and transport fee; `operatorToken` (magic link); start/end OTPs; optional `bookingId`; reviews and invoices.
- **CRM / B2B:** `Customer`, `SavedLocation` (named sites, geo, pincode); optional link `Customer.userId` to platform user for saved sites in bookings.
- **Billing:** `Invoice` (per trip, sequential FY numbering via `InvoiceCounter`), `Payment` records, Razorpay link fields, reminder timestamps.
- **Operator payroll:** `OperatorProfile`, `PayrollEntry` (monthly, PDF URL, deductions, PF flags).
- **Maintenance:** `MachineServiceLog`, `HourMeterEntry`, `BreakdownReport`.
- **Service coverage:** `ServiceableArea` (pincodes).
- **Content:** `Dictionary` per app/language/key.
- **Marketing CMS:** `SiteConfig` (key/value), `SiteSection` + `SiteBlock` (`SiteBlockType`: HERO, STAT, FEATURE_CARD, EQUIPMENT_CARD, etc.), `BlogPost` (bilingual fields, tags, SEO).

---

## 4. Shared API package (`@repo/api`)

`packages/api/src/root.ts` composes:

| Router | Responsibility |
|--------|----------------|
| `dictionary` | Label strings by app/language (`BOOKING` \| `ADMIN` \| `WEB`) |
| `auth` | Auth-related mutations (as defined in router) |
| `equipment` | `list`, **`getNearby`**, `search`, `get`/`create`/`update`; partner-scoped listings |
| `booking` | `create` (B2C style input), `getAll`, `getByPartner`; `updateStatus` **throws** — status changes must use authenticated server actions in admin |
| `partner` | Partner listing / detail / mutations for partner management |
| `masterCatalog` | Master catalog listing |

**`equipment.getNearby({ lat, lng })`** (`getNearbyEquipment` in `equipment-service.ts`): finds **VERIFIED** active partners whose service radius contains the point (haversine distance from partner base), aggregates fleet by `MasterCatalog` when linked, returns min/max rates and per-partner `equipmentId` rows for booking selection.

Exported helpers include **`verifyOtp`**, **`sendBookingsOtpWithWhatsApp`**, **`DEV_MASTER_OTP`**, **`getLabelsForApp`**, and types **`NearbyEquipmentItem`**, **`NearbyEquipmentOutput`**.

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
| `/` | **Requires login** — SSR `equipment.list()` fallback; client **`HomeContent`** switches to **`equipment.getNearby`** when user location is resolved |
| `/login` | Phone → OTP flow; links to legal pages |
| `/dashboard` | “My bookings” — active vs past tabs (`fetchMyBookingsForUser`) |
| `/profile` | Customer profile (incl. optional `companyName`) |
| `/track/[tripId]` | Trip tracking / timeline for customers |
| `/operator/[token]` | Operator-facing magic-link flows tied to `Trip.operatorToken` |
| `/legal/terms-and-conditions`, `/legal/privacy-policy` | Markdown-backed legal |

**Layout:** `force-dynamic`, Geist font, `DictionaryProvider` with `getBookingLabels`, conditional header, **`LocationHeader`** (job-site picker), page transitions, Sonner toasts.

### 5.3 Location & booking UX

- **`useLocationStore`** (Zustand + `localStorage` key `crux-user-location`): lat/lng, formatted address, `isResolved`, GPS `isLocating`.
- **`LocationHeader`:** Drawer search — Nominatim (OSM) or Google Places depending on `getMapsProvider()`; “use current location” with reverse geocode.
- **`HomeContent`:** Category filter chips; when location resolved, grid shows **nearby aggregated catalog** with partner count and price ranges; booking drawer uses **`SiteAddressPicker`** facade for site pin on map.
- **Server actions:** `fetchNearbyEquipment` → tRPC `equipment.getNearby`; `createBookingAction` in `app/actions/booking.ts`.

### 5.4 Notable API routes (`app/api/**`)

- `auth/[...nextauth]` — NextAuth handler
- `auth/send-otp`, `auth/verify-otp` — OTP HTTP helpers used by login actions
- `search` — equipment search
- `saved-locations` — persisted sites for customers (CRM-backed `SavedLocation` rows)
- `cron/invoice-payment-reminders` — scheduled invoice nudges

### 5.5 Business features (customer)

- **Location-aware marketplace:** browse equipment available within partner service radii; compare rates when multiple partners serve the same catalog type.
- Fallback **platform-wide equipment list** when no job site is set.
- Create **rental bookings** (hourly/daily pricing units, date range, site location via map picker) — backed by `booking.create` + Prisma `Booking` row (selected partner `equipmentId` when chosen from nearby results).
- **Account dashboard** for rental history and active jobs.
- **Trip tracking** and **operator** workflows aligned with `Trip` model (status, OTPs, tokens).
- **Legal compliance** surface (T&C, privacy).

### 5.6 Maps env (bookings)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MAPS_PROVIDER` | `osm` (default) or `google` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Required when provider is `google` |

---

## 6. Admin app (`apps/admin`) — platform + Partner OS

**Single codebase, role-based UX:** `User.role` drives navigation (`AdminSidebar` / bottom nav), theming nuances (`AdminShell`), and **authorization** in `auth.config.ts` + `lib/auth.ts`.

### 6.1 Auth

- **ADMIN:** **Google** sign-in restricted to **`@cruxgroup.in`** or emails listed in `ALLOWED_ADMIN_EMAILS` (comma-separated). `signIn` callback consults Prisma for existing elevated roles.
- **PARTNER:** **Phone OTP** credentials provider (`phone-otp`) with admin-specific phone normalization rules (`lib/phone.ts`, `ADMIN_PHONE_E164`).
- **USER:** If a plain B2C user hits the admin app while logged in, they are **redirected to the bookings app origin** (see `auth.config.ts`).
- **Post-login home:** `PARTNER` → `/fleet` (also used as safe redirect when hitting forbidden admin paths); `ADMIN` → `/dashboard`.

### 6.2 Route guard summary (`auth.config.ts`)

- **Partners cannot access:** `/platform-admin/*`, `/equipment`, `/partners`, `/bookings` **except** walk-in desk under **`/bookings/new`** (and subpaths), `/settings` except **`/settings/kyc`**, **`/website-cms`**, and other platform-only areas.
- **Partners hitting forbidden paths** are redirected to **`/fleet`** (not dashboard).
- **Admins** are kept off partner-only surface routes (`/fleet`, `/my-bookings`, `/service-area`, `/earnings`) — redirected to **`/dashboard`**.

### 6.3 Shell & onboarding

- **`AdminShell`:** If authenticated `PARTNER` has **no** `Partner` row → force **`/onboarding`**; if onboarded and on `/onboarding` → **`/dashboard`**.
- Partners get **mobile-first** chrome (`PartnerMobileHeader`, `PartnerBottomNav`); admins get parallel admin mobile components. Desktop: shared sidebar.

### 6.4 Navigation-driven feature map

**Platform admin (`ADMIN` nav)**

- **Dashboard** — `app/dashboard/page.tsx`: non-partner view is `DashboardHome` (platform metrics / tools).
- **Partners** — `/partners` (includes **service area map** for admin editing partner yard/radius via Google Maps)
- **KYC verification queue** — `/platform-admin/kyc`
- **Master catalog** — `/equipment`
- **Global bookings** — `/bookings` (list across partners; distinct from partner walk-in)
- **Website CMS** — `/website-cms` (hub → site config, sections/blocks, blog with Tiptap-style editing; `actions.ts` revalidates admin paths; public site uses same DB)
- **Settings** — `/settings` (admin profile / configuration; shows env health e.g. Google Maps key)

**Partner OS (`PARTNER` nav)**

- **Home** — `/dashboard` shows `PartnerCommandCenter` (fleet counts + cached BI via `getPartnerBusinessDashboard`).
- **Walk-in booking** — `/bookings/new` (B2B/walk-in desk; large form feature area).
- **Live job board** — `/jobs` (+ live API `app/api/jobs/live/route.ts`).
- **Inbound requests** — `/requests`
- **Fleet & health** — `/fleet`, machine health under `(dashboard)/fleet/[id]/health`, edits `fleet/[id]/edit`, add `fleet/new`
- **My bookings** — `/my-bookings` (partner-scoped booking view)
- **Payroll** — `/payroll`
- **Service area** — `/service-area` (partner self-serve: Google map + radius + base address; persists via partner APIs)
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
- **Marketing site operations:** manage homepage sections, equipment cards, FAQs, blog posts (bilingual), and global `SiteConfig` keys without redeploying `apps/web`.

### 6.6 Business features (partner)

- **Onboarding & KYC** capture (documents stored in Blob; status workflow).
- **Fleet management:** machines, pricing, transport radius, maintenance intervals, hour-meter and service logs, breakdown reporting, health views.
- **Demand:** inbound customer requests + live jobs board for dispatch coordination.
- **Walk-in / B2B desk:** create bookings tied to CRM-style context where implemented.
- **Payroll** for operators tied to `OperatorProfile` / `PayrollEntry`.
- **Earnings** views tied to trips/invoices/payments model.
- **Service area** management: map-based yard pin + **max service radius** (km) used by bookings `getNearby` matching.

---

## 7. Marketing web app (`apps/web`)

**Package:** `@crux/web`. **Production URL:** `NEXT_PUBLIC_SITE_URL` (default `https://www.cruxgroup.in`).

### 7.1 Routing & i18n

- **App Router** under `app/[locale]/…` with locales **`en`** (default) and **`te`**.
- **`middleware.ts`:** `/` → `/en`; paths without locale prefix redirect to `/en/…`.
- **Metadata routes:** `robots.ts`, `sitemap.ts`.
- **No NextAuth** for public visitors; CTAs link to bookings and admin URLs from `lib/env.ts`.

### 7.2 Content sources

| Surface | Source |
|---------|--------|
| Hero, stats, partners, customers, FAQ, CTA, fleet grid | Prisma `SiteSection` / `SiteBlock` + `SiteConfig` via `lib/content.ts` |
| Machine carousel (`MachineSections`) | Hardcoded `machine-sections-data.ts` (JCB, post-hole, crane slides) |
| Blog index & posts | Prisma `BlogPost` (`published` filter) |
| `content/content.json` | Legacy/unused in runtime (Dictionary-style keys only) |

Homepage section order: Hero → MachineSections → StatsBar → Fleet → ForPartners → ForCustomers → WhatsAppOrder → FAQ → CTAStrip.

### 7.3 Admin ↔ web coupling

- CMS mutations live in `apps/admin/app/(dashboard)/website-cms/actions.ts`.
- After publish/edit, admin actions call `revalidatePath` on CMS routes; public site relies on **ISR** (`revalidate = 3600`) unless extended with on-demand revalidation to `apps/web` paths.

---

## 8. Cross-cutting operational story

1. **Customer** (bookings app) authenticates with phone OTP → sets **job site** (`LocationHeader` / persisted store) → **`equipment.getNearby`** lists catalog types served by verified partners in range → selects partner equipment → **`booking.create`** with map-picked site address.
2. **Partner** maintains **service area** (yard + radius) in admin; only **VERIFIED** active partners participate in nearby matching.
3. Platform/partner workflows promote work into **`Trip`** records (scheduling, OTP-gated start/complete, operator magic link, overrun handling).
4. Completed work generates **`Invoice`** (+ PDF), **`Payment`** via Razorpay links, WhatsApp reminders.
5. **Reviews** capture dual ratings (machine + operator).
6. **Prospects** discover Crux on **`apps/web`**; CMS and blog are edited in admin **Website CMS**.

(Exact state transitions are implemented across server actions and services; this is the conceptual spine reflected in Prisma.)

---

## 9. Conventions for contributors & LLMs

- Prefer **role-aware server actions** in admin for mutations that touch `Booking`, `Trip`, or `Equipment` ownership — do not re-enable deprecated `booking.updateStatus` over public tRPC.
- When adding **Edge** code paths, keep imports compatible with `auth.config.ts` (no `@repo/db` / Prisma).
- Respect **monetary type = Int paise** unless explicitly geo or meter readings (`Float` allowed for coordinates, km, hours).
- **Partner vs admin URL collisions:** `/bookings` is admin-global; `/bookings/new` is partner walk-in — enforced in `auth.config.ts`.
- **Maps:** Use `getMapsProvider()` / `SiteAddressPicker` facade in bookings; do not assume Google is always configured. Default OSM for zero-cost dev; switch to Google for production launch.
- **Nearby equipment:** Always pass resolved lat/lng from the location store (or booking form), not a hardcoded default — matching uses partner `maxServiceRadius` / coordinates.
- **Website copy:** Prefer CMS `SiteBlock` bilingual fields over hardcoding strings in `apps/web` components.

---

## 10. How to regenerate or extend this document

Update this file when:

- New first-class routes appear under `apps/*/app`.
- Prisma schema gains models or enum values that change product semantics.
- Auth rules in `apps/admin/auth.config.ts` / `apps/admin/lib/auth.ts` or bookings `lib/auth.ts` change.
- Maps provider strategy or env vars change (`maps-config.ts`, service-area map).
- New third-party integrations or env vars are added to `turbo.json` / deployment.
- Website CMS block types or locale strategy in `apps/web` change.

For deep implementation detail, grep from the paths cited above rather than duplicating every server action name here.
