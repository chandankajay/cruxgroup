# apps/web — Technical Overview

Shareable context for AI assistants working on the Crux marketing site (`@crux/web`).

---

## 1. Framework

**Next.js** (v16.2.0) with React 19.

- Scripts: `next dev --port 3002`, `next build`, `next start`
- Package: `apps/web/package.json`
- Not Vite, Astro, or CRA

---

## 2. Router type

**App Router** — all routes live under `app/`.

- There is **no** `pages/` directory.

---

## 3. i18n setup

**Custom locale routing** (not `next-intl`, `i18next`, or `react-intl`).

| Detail | Value |
|--------|--------|
| Supported locales | `en`, `te` |
| URL pattern | Locale prefix: `/en`, `/te`, `/en/blog`, `/te/blog/:slug`, etc. |
| Route segment | Dynamic `app/[locale]/...` |
| Default locale | `/` redirects to `/en` |
| Paths without locale | Redirect to `/en` + path (e.g. `/blog` → `/en/blog`) |
| Static params | `generateStaticParams` in `app/[locale]/layout.tsx` returns `[{ locale: "en" }, { locale: "te" }]` |
| Client language | `LanguageProvider`, `LanguageToggle`, `BillingText` components |
| Copy model | Bilingual `_en` / `_te` fields on DB blocks and `siteConfig`; hardcoded slides use `title_en` / `title_te` |

**Key files**

- `middleware.ts` — locale detection and redirects
- `lib/locale.ts` — `Locale` type and `parseLocale()`
- `app/[locale]/layout.tsx` — locale layout wrapper

**Middleware behavior** (excerpt):

```ts
const LOCALES = ["en", "te"] as const;

// "/" → "/en"
// "/blog" → "/en/blog"
// Skips: /api, /_next, static assets, /robots.txt, /sitemap.xml
```

---

## 4. Equipment / fleet data on the homepage

The homepage has **two** equipment-related sections with **different** data sources.

### A. Fleet grid (`#fleet`) — Prisma DB

- **Source:** Prisma via `getSiteSection("fleet")` in `lib/content.ts`
- **Blocks:** Filtered to `type === "EQUIPMENT_CARD"`
- **Headings/subcopy:** From `siteConfig` keys (`fleetHeading_en`, `fleetHeading_te`, etc.)
- **Not:** hardcoded array, REST API, or CMS

**Homepage fetch** (`app/[locale]/page.tsx`):

```ts
getSiteSection("fleet"),
// ...
const fleetBlocks =
  fleetSection?.blocks.filter((b) => b.type === "EQUIPMENT_CARD") ?? [];
```

**DB helper** (`lib/content.ts`):

```ts
export async function getSiteSection(slug: string) {
  return prisma.siteSection.findFirst({
    where: { slug, published: true },
    include: {
      blocks: {
        where: { published: true },
        orderBy: { order: "asc" },
      },
    },
  });
}
```

**UI:** `components/sections/Fleet.tsx` — renders `blocks` with `FleetIcon`, `BillingText`

### B. Machine carousel (`MachineSections`) — Hardcoded

- **Source:** `MACHINE_SLIDES` in `components/sections/machine-sections-data.ts`
- **Slides:** JCB, Post Hole Digger, Crane (static copy + images under `/public/images/`)
- **Not:** Prisma, API, or CMS

**Homepage usage:**

```tsx
<MachineSections />
```

**Data file** (excerpt):

```ts
export const MACHINE_SLIDES = [
  { id: "jcb", image: "/images/jcb-section.jpg", title_en: "JCB Backhoe Loader", ... },
  { id: "posthole", ... },
  { id: "crane", ... },
] as const;
```

### Other homepage content

- Hero, stats, partners, customers, FAQ, CTA — mostly Prisma `siteSection` / `siteConfig`
- `content/content.json` exists but is **not imported** anywhere in this app (legacy/unused)

### Revalidation

- Homepage: `export const revalidate = 3600` (ISR, 1 hour)

---

## 5. Routes / files under `app/`

No `pages/` directory.

| File | Role | Public URLs (examples) |
|------|------|-------------------------|
| `app/layout.tsx` | Root layout | (wraps all) |
| `app/[locale]/layout.tsx` | Locale shell (nav, footer, `LanguageProvider`) | `/en`, `/te` |
| `app/[locale]/page.tsx` | **Homepage** | `/en`, `/te` |
| `app/[locale]/blog/page.tsx` | Blog index | `/en/blog`, `/te/blog` |
| `app/[locale]/blog/[slug]/page.tsx` | Blog post (Prisma `blogPost`) | `/en/blog/:slug`, `/te/blog/:slug` |
| `app/[locale]/blog/components/TagFilter.tsx` | Blog UI component | (not a route) |
| `app/not-found.tsx` | 404 page | |
| `app/error.tsx` | Route error boundary | |
| `app/global-error.tsx` | Global error boundary | |
| `app/robots.ts` | Metadata route | `/robots.txt` |
| `app/sitemap.ts` | Metadata route | `/sitemap.xml` |

**Dev port:** 3002 (`pnpm dev` in `apps/web`)

---

## 6. Homepage

**File path:** `apps/web/app/[locale]/page.tsx`

**First 30 lines:**

```tsx
import type { Metadata } from "next";
import type { SiteBlock } from "@prisma/client";
import { Hero } from "../../components/sections/Hero";
import { MachineSections } from "../../components/sections/MachineSections";
import { StatsBar } from "../../components/sections/StatsBar";
import { Fleet } from "../../components/sections/Fleet";
import { ForPartners } from "../../components/sections/ForPartners";
import { ForCustomers } from "../../components/sections/ForCustomers";
import { FAQ } from "../../components/sections/FAQ";
import { WhatsAppOrder } from "../../components/sections/WhatsAppOrder";
import { CTAStrip } from "../../components/sections/CTAStrip";
import {
  getSiteConfig,
  getSiteConfigMap,
  getSiteSection,
} from "../../lib/content";
import { SITE_URL } from "../../lib/env";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Heavy Equipment Rental, Telangana",
  description:
    "Book JCBs, Cranes, Excavators, Dozers and more across Telangana. One platform for contractors and fleet owners.",
  keywords: [
    "equipment rental telangana",
    "JCB on rent hyderabad",
    "crane rental",
    "excavator hire telangana",
  ],
```

**Section order on page:** Hero → MachineSections → StatsBar → Fleet → ForPartners → ForCustomers → WhatsAppOrder → FAQ → CTAStrip

---

## Dependencies worth noting

- `@repo/db` — shared Prisma client
- `@prisma/client` — types (`SiteBlock`, `BlogPost`, etc.)
- `server-only` on `lib/content.ts`
- Tailwind CSS 4, Framer Motion (desktop machine sections)

---

*Generated for AI context sharing. Update when routing or data sources change.*
