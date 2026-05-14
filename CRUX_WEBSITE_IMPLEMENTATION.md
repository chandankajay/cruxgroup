# Crux Group — `apps/website` Implementation Prompt (Phase-wise)

> Paste each phase into Cursor as a standalone prompt. Complete and verify each phase before moving to the next.
> This is a **production-grade** Next.js website for `cruxgroup.in` — not a template, not a school project.

---

## Context (read before every phase)

- **Monorepo:** `pnpm` + Turborepo. New app lives at `apps/website`.
- **Stack match:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma + MongoDB (shared `@repo/db`), tRPC (`@repo/api`).
- **Auth:** NextAuth v5 — NOT needed for public website visitors, but admin-gated blog CMS reuses admin app's Google auth pattern.
- **Brand:** Construction-first. Orange `#d45800` primary. Dark near-black `#0f0e0d` backgrounds. Off-white `#f5f0eb` text/surfaces.
- **Logo:** SVG file will be placed at `apps/website/public/logo.svg` — reference it everywhere; never hardcode a text fallback as the permanent solution.
- **External links:** `https://bookings.cruxgroup.in` (customer CTA) and `https://admin.cruxgroup.in` (partner/admin CTA).
- **Phone:** Pulled from CMS content (never hardcoded in components).
- **Languages:** English (default) + Telugu toggle.
- **Deployment:** Vercel, same project as other apps — add `apps/website` as a new Vercel project pointed at this app directory.
- **Monetary rule:** Not applicable for this app — no pricing displayed (avoid committing to numbers).

---

## Phase 1 — Monorepo scaffolding & app skeleton

### Goal
Bootstrap `apps/website` so it runs on port `3002`, shares all existing packages, and deploys to Vercel cleanly.

### Prompt

```
We are adding a new Next.js 16 (App Router) app called `apps/website` to our existing Turborepo monorepo.
The monorepo uses pnpm workspaces, Turborepo, shared packages at @repo/db, @repo/api, @repo/ui, @repo/tailwind-config, @repo/typescript-config.

Do the following:

1. Scaffold `apps/website` with:
   - `package.json` named `@repo/website`, dev port 3002
   - `next.config.ts` — App Router, no src/ dir, images domains: ["img1.wsimg.com", "res.cloudinary.com", "cdn.cruxgroup.in"]
   - `tsconfig.json` extending `@repo/typescript-config/nextjs.json`
   - Tailwind CSS v4 with `@tailwindcss/postcss`, extending `@repo/tailwind-config`
   - `postcss.config.mjs`
   - `app/layout.tsx` — root layout with Geist font (same as other apps), sets `lang="en"` by default, includes metadata exports
   - `app/page.tsx` — placeholder "Crux Group — coming soon" that we will replace in Phase 2
   - `public/` folder with a `logo.svg` placeholder (simple SVG text "CRUX" in #d45800)
   - `.env.example` with: NEXT_PUBLIC_BOOKINGS_URL, NEXT_PUBLIC_ADMIN_URL, NEXT_PUBLIC_PHONE, NEXT_PUBLIC_EMAIL, CRON_SECRET

2. Add `apps/website` to `turbo.json` pipeline (build, dev, lint, check-types).

3. Update root `pnpm-workspace.yaml` if needed to include `apps/website`.

4. Add a `vercel.json` at `apps/website/vercel.json`:
   {
     "buildCommand": "cd ../.. && pnpm turbo run build --filter=@repo/website",
     "installCommand": "pnpm install",
     "outputDirectory": "apps/website/.next",
     "framework": "nextjs"
   }

5. In `apps/website/app/layout.tsx`, set up:
   - Open Graph metadata defaults (title: "Crux Group", description: "Telangana's largest heavy equipment rental network")
   - Google-friendly robots meta
   - Canonical URL support via generateMetadata pattern

6. Create `apps/website/lib/env.ts` that exports typed constants:
   BOOKINGS_URL, ADMIN_URL, PHONE, EMAIL — sourced from process.env with fallbacks.

Do NOT touch apps/bookings or apps/admin. Do NOT install new root-level dependencies without checking if they already exist in the monorepo.
```

---

## Phase 2 — Content schema (CMS-first, no hardcoded copy)

### Goal
Every string, image URL, CTA label, and phone number visible on the website must be stored in MongoDB and editable without touching source code. Build the Prisma models and seed data.

### Prompt

```
We need a CMS content layer for apps/website backed by the existing MongoDB + Prisma setup in packages/db.

1. Add the following models to packages/db/prisma/schema.prisma:

   model SiteConfig {
     id        String   @id @default(auto()) @map("_id") @db.ObjectId
     key       String   @unique   // e.g. "phone", "email", "heroTagline_en", "heroTagline_te"
     value     String
     updatedAt DateTime @updatedAt
   }

   model SiteSection {
     id        String   @id @default(auto()) @map("_id") @db.ObjectId
     slug      String   @unique  // e.g. "hero", "fleet", "partners", "customers", "stats", "faq"
     order     Int
     published Boolean  @default(true)
     blocks    SiteBlock[]
   }

   model SiteBlock {
     id          String      @id @default(auto()) @map("_id") @db.ObjectId
     sectionId   String      @db.ObjectId
     section     SiteSection @relation(fields: [sectionId], references: [id])
     type        SiteBlockType
     order       Int
     // Bilingual text fields
     heading_en  String?
     heading_te  String?
     body_en     String?
     body_te     String?
     cta_label_en String?
     cta_label_te String?
     cta_href    String?
     imageUrl    String?
     videoUrl    String?
     icon        String?    // Lucide icon name string
     published   Boolean    @default(true)
   }

   enum SiteBlockType {
     HERO
     STAT
     FEATURE_CARD
     EQUIPMENT_CARD
     TESTIMONIAL
     FAQ_ITEM
     HOOK_BANNER
     CTA_STRIP
   }

   model BlogPost {
     id          String      @id @default(auto()) @map("_id") @db.ObjectId
     slug        String      @unique
     title_en    String
     title_te    String?
     excerpt_en  String?
     excerpt_te  String?
     body_en     String      // Rich text HTML (from Tiptap)
     body_te     String?
     coverImage  String?
     published   Boolean     @default(false)
     publishedAt DateTime?
     authorName  String?
     tags        String[]
     createdAt   DateTime    @default(now())
     updatedAt   DateTime    @updatedAt
     seoTitle    String?
     seoDesc     String?
   }

2. Run `pnpm db:generate` to regenerate the Prisma client.

3. Create `packages/db/src/seeds/website.seed.ts` with realistic seed data for:

   SiteConfig entries:
   - phone: "9182054293"
   - email: "connect@cruxgroup.in"
   - address: "Kothur, Telangana, India"
   - instagram: "https://www.instagram.com/cruxgroup.in"
   - youtube: "https://www.youtube.com/@cruxgroup"
   - heroTagline_en: "Telangana's Heavy Equipment Network"
   - heroSubtitle_en: "JCBs, Cranes, Excavators, Dozers — on-demand. Built for builders."
   - heroTagline_te: "తెలంగాణ హెవీ ఎక్విప్‌మెంట్ నెట్‌వర్క్"
   - heroSubtitle_te: "JCBలు, క్రేన్లు, ఎక్స్‌కవేటర్లు — అవసరమైనప్పుడు అందుబాటులో."
   - partnerHook_en: "Your machines sit idle. Every hour costs you."
   - partnerHook_te: "మీ యంత్రాలు నిష్క్రియంగా ఉన్నాయి. ప్రతి గంట నష్టమే."

   SiteSection + SiteBlock entries covering:
   - hero (1 HERO block)
   - stats (4 STAT blocks: machines on platform, partner fleet owners, districts covered, bookings completed — use plausible round numbers you will update later)
   - fleet (8 EQUIPMENT_CARD blocks: JCB, Crane, Mini Crane, Excavator, Dozer, Road Roller, Post Hole Digger, Compactor)
   - partners (3 FEATURE_CARD blocks: hook/FOMO messaging for fleet owners)
   - customers (3 FEATURE_CARD blocks: messaging for contractors/developers)
   - faq (5 FAQ_ITEM blocks with real questions)
   - cta (1 CTA_STRIP block with dual CTAs)

   BlogPost: 2 sample posts (published: false) as placeholders.

4. Create `apps/website/lib/content.ts` with typed helper functions:
   - `getSiteConfig(key: string): Promise<string>` — fetches single SiteConfig value
   - `getSiteSection(slug: string): Promise<SiteSection & { blocks: SiteBlock[] }>` — fetches section with ordered blocks
   - `getAllPublishedPosts(): Promise<BlogPost[]>`
   - `getPostBySlug(slug: string): Promise<BlogPost | null>`
   These should use `@repo/db` Prisma client directly (server-only).

5. Export a `SiteConfigMap` type and `getSiteConfigMap(keys: string[]): Promise<Record<string, string>>` for batch fetching.

All helper functions must be marked with `"use server"` or imported only from server components. Add `// server-only` comment at top of the file.
```

---

## Phase 3 — Design system & global styles

### Goal
Establish the visual identity: color tokens, typography scale, animation utilities, and reusable layout primitives. This phase has zero database calls — pure CSS/component work.

### Prompt

```
Set up the design system for apps/website. This must be a production-quality, distinctive visual identity — NOT a generic template.

Brand:
- Primary orange: #d45800
- Dark background: #0f0e0d
- Surface (cards): #1a1917
- Subtle border: #2a2825
- Off-white text: #f5f0eb
- Muted text: #9a9490
- Accent warm: #ff7a2f (hover/glow states)

1. In `apps/website/app/globals.css`:
   - Define CSS custom properties for all brand tokens above
   - Set up Tailwind CSS v4 @theme block registering these as Tailwind tokens:
     --color-brand, --color-dark, --color-surface, --color-border, --color-offwhite, --color-muted, --color-accent
   - Base styles: dark background default, smooth scrolling, selection color using brand orange
   - Custom scrollbar (webkit) styled in dark + orange
   - CSS keyframe animations:
     @keyframes fadeUp (opacity 0→1, translateY 24px→0)
     @keyframes fadeIn (opacity 0→1)
     @keyframes scaleIn (scale 0.95→1, opacity 0→1)
     @keyframes shimmer (background-position slide for skeleton loading)
   - Utility classes: .animate-fade-up, .animate-fade-in, .animate-scale-in with configurable delay via --delay CSS var

2. Create `apps/website/components/ui/` with these primitives:

   Button.tsx:
   - Variants: "primary" (orange fill, glow on hover), "outline" (orange border, transparent), "ghost"
   - Sizes: sm, md, lg
   - Optional icon prop (left/right)
   - Hover: subtle scale transform + box-shadow glow for primary variant
   - All CTAs that link to bookings/admin should use this component

   SectionWrapper.tsx:
   - Wraps each page section with consistent max-width (1280px), horizontal padding, vertical padding
   - Accepts `id` prop for anchor navigation
   - Optional `dark` boolean for alternate background surface

   AnimateOnScroll.tsx:
   - Client component using IntersectionObserver
   - Accepts: children, animation ("fadeUp" | "fadeIn" | "scaleIn"), delay (ms), threshold
   - Adds animation class when element enters viewport
   - Respects prefers-reduced-motion media query

   LanguageToggle.tsx:
   - Client component, stores language choice in localStorage + React context
   - "EN | తె" pill toggle in navbar
   - Exposes useLang() hook returning { lang: "en" | "te", setLang }

   LanguageProvider.tsx:
   - Wraps app layout, provides lang context
   - Default: "en"

   BillingText.tsx:
   - Accepts { en: string; te: string }
   - Reads from useLang() and renders the correct string
   - Used everywhere copy renders

3. Create `apps/website/components/layout/`:

   Navbar.tsx:
   - Fixed top, backdrop-blur dark background
   - Left: logo (SVG import from /public/logo.svg as next/image)
   - Center: nav links (smooth scroll anchors): About, Fleet, Partners, Customers, Blog, Contact
   - Right: LanguageToggle + two distinct CTA buttons:
     "Rent Equipment" → BOOKINGS_URL (primary orange button)
     "Partner with Us" → ADMIN_URL (outline button)
   - Mobile: hamburger menu with slide-down drawer
   - On scroll: adds subtle border-bottom

   Footer.tsx:
   - Dark surface background
   - Left: logo + tagline (from SiteConfig, passed as prop)
   - Center: quick links + social icons (Instagram, YouTube)
   - Right: contact info (phone as tel: link, email, address)
   - Bottom bar: copyright + "Built with ♥ in Telangana"
   - All content passed as props (no direct DB calls in this component)

4. Update `apps/website/app/layout.tsx` to:
   - Wrap children with LanguageProvider
   - Include Navbar and Footer
   - Accept footerData prop fetched server-side in layout
   - Use Geist Sans + Geist Mono from next/font/google

Do NOT use any third-party component libraries (no shadcn, no MUI). Pure Tailwind + custom CSS only.
```

---

## Phase 4 — Homepage (all sections)

### Goal
Build the full homepage as a Next.js server component page that fetches content from MongoDB and renders all sections with scroll animations.

### Prompt

```
Build the complete homepage at apps/website/app/page.tsx.

The page is a Next.js server component (no "use client" at the page level). It fetches all section data server-side using the helpers from apps/website/lib/content.ts, then passes data down to client components for animations.

Each section must:
- Use AnimateOnScroll for entrance animations
- Be mobile-first responsive (stack on mobile, grid on desktop)
- Pull ALL copy from SiteBlock / SiteConfig data (no hardcoded strings in JSX)
- Respect the bilingual system via BillingText component

Implement the following sections in order:

---

### Section 1: Hero
Component: `components/sections/Hero.tsx`

Layout: Full-viewport height, dark background, large centered text.
- Eyebrow label (small caps, brand orange): e.g. "Telangana's #1 Equipment Network"
- H1: heroTagline from SiteConfig, very large (clamp 3rem–6rem), bold, off-white
- Subtitle: heroSubtitle from SiteConfig, muted, max-width 600px
- Two CTA buttons side by side:
  - "Book a Machine" → BOOKINGS_URL (primary, large)
  - "Register Your Fleet" → ADMIN_URL (outline, large)
- Background: subtle animated gradient (dark orange glow radial, very subtle, no kitsch)
- Below fold hint: animated chevron-down icon

---

### Section 2: Stats bar
Component: `components/sections/StatsBar.tsx`

Layout: Full-width dark surface strip, 4 stats in a row (2x2 on mobile).
- Each stat: large number (animate count-up on scroll), label below
- Data from SiteSection "stats" → STAT blocks
- Separator lines between stats on desktop

Implement a CountUp client component that animates from 0 to the target number when it enters the viewport.

---

### Section 3: Fleet showcase
Component: `components/sections/Fleet.tsx`

Layout: Section with heading + subtitle, then a responsive grid (2 cols mobile, 4 cols desktop).
- Each card: EQUIPMENT_CARD block → icon (Lucide or emoji fallback), equipment name, one-line description
- Cards have subtle hover: lift shadow + orange border glow
- Cards are NOT links — they are informational. No pricing shown.
- Heading (from SiteBlock): something like "Every Machine You Need. One Platform."

Equipment cards to render (from seed data):
JCB, Crane, Mini Crane, Excavator, Dozer, Road Roller, Post Hole Digger, Compactor

---

### Section 4: Partner FOMO section (fleet owners)
Component: `components/sections/ForPartners.tsx`

Layout: Dark section, asymmetric — left side large hook text, right side 3 feature cards stacked.
- Large hook headline (from SiteBlock, e.g. "Your machines sit idle. Every hour costs you.")
- Subtext (from SiteBlock): one punchy sentence about joining the network
- 3 FEATURE_CARD blocks: e.g. "More Bookings", "Zero Marketing Cost", "You Stay in Control"
- Primary CTA button: "List Your Fleet Today" → ADMIN_URL
- Visual treatment: subtle orange gradient edge on the left, card glow on hover
- This section must feel urgent and FOMO-inducing — use the copy from seed exactly as seeded

---

### Section 5: For Customers section
Component: `components/sections/ForCustomers.tsx`

Layout: Light-surface section (--color-surface), heading + 3 feature cards in a row.
- Audience: contractors, venture developers, farmers, infra companies
- 3 FEATURE_CARD blocks: e.g. "On-demand machines", "Verified operators", "Track in real time"
- Primary CTA: "Book a Machine Now" → BOOKINGS_URL
- Secondary CTA: "Call Us" → tel:{phone} (phone fetched from SiteConfig)

---

### Section 6: FAQ accordion
Component: `components/sections/FAQ.tsx`

Layout: Centered, max-width 800px, stacked accordion items.
- Each FAQ_ITEM block: heading_en/te as question, body_en/te as answer
- Accordion: click to expand, smooth height animation (CSS transition, no library)
- Client component

---

### Section 7: CTA strip
Component: `components/sections/CTAStrip.tsx`

Layout: Full-width brand orange background section.
- Large centered headline (from CTA_STRIP block)
- Two buttons: "Start Renting" → BOOKINGS_URL and "Become a Partner" → ADMIN_URL
- Both buttons white fill on orange background variant

---

### Page assembly in app/page.tsx:

```tsx
// Fetch all sections server-side in parallel
const [heroConfig, statsSection, fleetSection, partnersSection, customersSection, faqSection, ctaSection, phone] = await Promise.all([
  getSiteConfigMap(["heroTagline_en","heroTagline_te","heroSubtitle_en","heroSubtitle_te","partnerHook_en","partnerHook_te"]),
  getSiteSection("stats"),
  getSiteSection("fleet"),
  getSiteSection("partners"),
  getSiteSection("customers"),
  getSiteSection("faq"),
  getSiteSection("cta"),
  getSiteConfig("phone"),
]);
```

Pass data as props to each section component.

Set page metadata:
```tsx
export const metadata = {
  title: "Crux Group — Heavy Equipment Rental, Telangana",
  description: "Book JCBs, Cranes, Excavators, Dozers and more across Telangana. One platform for contractors and fleet owners.",
  keywords: ["equipment rental telangana", "JCB on rent hyderabad", "crane rental", "excavator hire telangana"],
  openGraph: { ... }
}
```
```

---

## Phase 5 — Blog (public routes + SEO)

### Goal
Public blog listing and post pages, fully SEO-optimised with dynamic sitemap and structured data.

### Prompt

```
Build the blog module for apps/website.

1. `app/blog/page.tsx` — Blog listing page
   - Server component
   - Fetches all published BlogPosts via getAllPublishedPosts()
   - Renders: page header ("Insights from the Field"), tag filter strip (client component), grid of post cards
   - Post card: cover image (next/image), title (bilingual), excerpt, date, tags, "Read More →" link
   - If no posts published yet: elegant empty state ("Coming soon — our team is writing for you.")
   - Metadata: title "Blog — Crux Group", description, OG

2. `app/blog/[slug]/page.tsx` — Individual post page
   - generateStaticParams: fetch all published post slugs
   - generateMetadata: use post.seoTitle, post.seoDesc, post.coverImage for OG
   - Server component: fetches post by slug
   - Layout: narrow content column (max-width 720px), centered
   - Renders: cover image (full-width hero), title, author + date, tags, body HTML via dangerouslySetInnerHTML (body is trusted Tiptap HTML from our own admin)
   - Add JSON-LD structured data (Article schema) in a <script type="application/ld+json"> tag
   - "← Back to Blog" link
   - 404 if post not found or not published

3. `app/sitemap.ts` — Dynamic sitemap
   - Include: /, /blog, /blog/[each published slug]
   - Use correct changeFrequency and priority values

4. `app/robots.ts` — Robots file
   - Allow all, sitemap URL pointing to production domain

5. `app/blog/components/TagFilter.tsx` — Client component
   - Receives allTags string[]
   - Active tag highlights in orange
   - Clicking a tag filters the visible posts (client-side filter, no re-fetch)
   - "All" option resets filter

All post body HTML must be wrapped in a `prose` class — add a custom Tailwind v4 prose style block in globals.css:
- Base font: off-white on dark
- h2, h3: off-white, bold
- a: brand orange, underline on hover
- blockquote: left border orange, muted text
- code: dark surface background, monospace
- img: rounded, full-width
```

---

## Phase 6 — Admin CMS for website content

### Goal
Add website content management to the existing `apps/admin` app behind admin auth. This is where all website copy, blog posts, site config, and sections are managed.

### Prompt

```
Add a "Website CMS" section to the existing apps/admin app. This is for ADMIN role only — partners cannot access it.

1. Update `apps/admin/auth.config.ts` to add `/website-cms/*` to the list of paths forbidden for PARTNER role (redirect to /fleet as per existing pattern).

2. Create the following routes under `apps/admin/app/(dashboard)/website-cms/`:

   page.tsx — CMS dashboard
   - Cards linking to: Site Config, Sections & Blocks, Blog Posts
   - Show counts (total posts, published posts, total blocks)

   site-config/page.tsx — Key-value editor
   - Fetch all SiteConfig entries
   - Render as an editable list: each row has key (read-only label), value (input), Save button
   - Server action: updateSiteConfig(key, value) — upserts the SiteConfig record
   - Group by category (contact info, hero copy, social links)

   sections/page.tsx — Section list
   - List all SiteSections ordered by `order`
   - Toggle published on/off inline
   - Link to edit individual sections

   sections/[slug]/page.tsx — Block editor for a section
   - List all SiteBlocks for this section ordered by `order`
   - Each block: inline editable fields for heading_en, heading_te, body_en, body_te, cta_label_en, cta_label_te, cta_href, imageUrl, icon
   - Drag-to-reorder (use @dnd-kit/core — check if already in monorepo, if not add to apps/admin only)
   - Add block button (select SiteBlockType from dropdown)
   - Delete block with confirmation
   - Server actions: updateBlock, createBlock, deleteBlock, reorderBlocks

   blog/page.tsx — Post list
   - Table: title, status (draft/published), publishedAt, tags, Edit / Delete actions
   - "New Post" button → blog/new/page.tsx
   - Toggle published inline

   blog/new/page.tsx and blog/[id]/edit/page.tsx — Post editor
   - Fields: title_en, title_te, excerpt_en, excerpt_te, slug (auto-generated from title_en, editable), coverImage URL, tags (comma-separated), seoTitle, seoDesc, authorName
   - Rich text body: Tiptap editor for body_en and body_te tabs
     Install: @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder (in apps/admin package.json only)
   - Toolbar: Bold, Italic, Heading (H2/H3), Bullet list, Link, Image URL insert, Blockquote, Code block
   - Preview panel: renders the HTML with the same prose CSS as the public blog
   - Save as draft / Publish buttons
   - Server actions: createBlogPost, updateBlogPost, deleteBlogPost

3. Add "Website CMS" nav item to AdminSidebar with a Globe icon (Lucide) — visible only to ADMIN role.

4. All server actions live in `apps/admin/app/(dashboard)/website-cms/actions.ts`:
   - Import Prisma client from @repo/db
   - All actions check session role === "ADMIN" before executing — throw if not
   - Return { success: boolean, error?: string } pattern consistent with existing admin actions

Do NOT break any existing admin routes. Do NOT touch partner-facing routes.
```

---

## Phase 7 — Telugu language system (i18n)

### Goal
Wire up the bilingual system end-to-end so the language toggle on the public website switches all copy instantly, and the URL reflects the language for SEO.

### Prompt

```
Implement the bilingual (English / Telugu) language system for apps/website.

Architecture decision: Use URL-based locale routing (Next.js built-in i18n) so search engines index both language versions.

1. Update `apps/website/next.config.ts`:
   Add i18n config:
   ```js
   i18n: {
     locales: ["en", "te"],
     defaultLocale: "en",
   }
   ```

2. Update `LanguageToggle.tsx` and `LanguageProvider.tsx`:
   - On toggle, use next/router to push to the same path with the opposite locale prefix
   - Read the current locale from useRouter().locale
   - Remove localStorage dependency (URL is now the source of truth)
   - useLang() returns the current locale from router

3. Update `BillingText.tsx`:
   - Reads locale from context (which reads from router)
   - Falls back to "en" if "te" string is null/empty

4. Update all Section components to pass both _en and _te fields from SiteBlock to BillingText — verify no component has hardcoded English strings.

5. Update Navbar links to preserve locale when navigating: use next/link with locale prop.

6. Update sitemap.ts to include both locale variants:
   - /en, /te, /en/blog, /te/blog, /en/blog/[slug], /te/blog/[slug]
   - Add hreflang alternates in each post page's metadata (alternates.languages)

7. Add a `<html lang={locale}>` attribute driven by the current locale in layout.tsx.

8. Update generateMetadata in app/blog/[slug]/page.tsx to return:
   - title: locale === "te" ? post.title_te ?? post.title_en : post.title_en
   - description: locale === "te" ? post.excerpt_te ?? post.excerpt_en : post.excerpt_en

9. Test checklist (add as code comments in the PR description):
   - [ ] Switching to /te/ shows Telugu copy in Hero
   - [ ] All SiteBlocks with null te fields gracefully fall back to en
   - [ ] Blog post with no te content still renders in en on /te/blog/[slug]
   - [ ] Sitemap includes both locales
```

---

## Phase 8 — Performance, SEO hardening & Vercel deployment

### Goal
Make the site production-ready: Core Web Vitals optimised, structured data complete, Vercel project configured, and all env vars documented.

### Prompt

```
Harden apps/website for production deployment on Vercel.

1. Performance:
   - Add `next/image` to every image in all section components (replace any raw <img> tags)
   - Set correct `sizes` attributes on all images
   - Add `priority` prop to Hero image/background only
   - Lazy-load all other images (default next/image behavior)
   - Add `loading="lazy"` to all iframes if any
   - Ensure AnimateOnScroll uses `will-change: transform` only during animation, removes it after
   - Wrap CountUp in `React.memo` to prevent re-renders
   - All section server components: add `export const revalidate = 3600` (1-hour ISR cache) so content changes propagate without full redeploy

2. Structured data:
   - Add Organization schema JSON-LD to app/layout.tsx:
     ```json
     {
       "@context": "https://schema.org",
       "@type": "Organization",
       "name": "Crux Group",
       "url": "https://www.cruxgroup.in",
       "logo": "https://www.cruxgroup.in/logo.svg",
       "contactPoint": { "@type": "ContactPoint", "telephone": "{phone}", "contactType": "customer service" },
       "areaServed": "Telangana, India",
       "sameAs": ["{instagram}", "{youtube}"]
     }
     ```
   - Fetch phone, instagram, youtube from SiteConfig server-side in layout.tsx and inject into the schema.
   - Add LocalBusiness schema too (same data).

3. Security headers in `apps/website/next.config.ts`:
   ```js
   headers: async () => [{
     source: "/(.*)",
     headers: [
       { key: "X-Frame-Options", value: "DENY" },
       { key: "X-Content-Type-Options", value: "nosniff" },
       { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
       { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
     ]
   }]
   ```

4. `apps/website/.env.example` — complete and accurate:
   ```
   NEXT_PUBLIC_BOOKINGS_URL=https://bookings.cruxgroup.in
   NEXT_PUBLIC_ADMIN_URL=https://admin.cruxgroup.in
   NEXT_PUBLIC_PHONE=9182054293
   NEXT_PUBLIC_EMAIL=connect@cruxgroup.in
   NEXT_PUBLIC_SITE_URL=https://www.cruxgroup.in
   DATABASE_URL=mongodb+srv://...
   ```

5. Vercel deployment checklist (add as DEPLOYMENT.md in apps/website/):
   - Create new Vercel project, root directory: apps/website
   - Build command: `cd ../.. && pnpm turbo run build --filter=@repo/website`
   - Output directory: .next
   - Framework: Next.js
   - Add all env vars from .env.example
   - Add CNAME for cruxgroup.in → vercel DNS
   - Enable "Automatically expose System Environment Variables"

6. Add `app/not-found.tsx`:
   - Branded 404 page with logo, "Page not found" message, back to home CTA button
   - Dark themed, consistent with site design

7. Add `app/error.tsx` and `app/global-error.tsx`:
   - Branded error pages
   - Include a "Reload" button and "Go Home" link

8. Lighthouse targets (document in DEPLOYMENT.md):
   - Performance: ≥90
   - Accessibility: ≥95
   - SEO: 100
   - Best Practices: ≥95

9. Add `apps/website/README.md` covering:
   - How to run locally (pnpm dev --filter=@repo/website)
   - How to update content (link to /website-cms in admin app)
   - How to add a new section type
   - Env var reference
```

---

## Quick reference: file tree after all phases

```
apps/website/
├── app/
│   ├── layout.tsx              # Root layout, Navbar, Footer, LanguageProvider
│   ├── page.tsx                # Homepage (all sections)
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── globals.css
│   └── blog/
│       ├── page.tsx            # Blog listing
│       ├── [slug]/page.tsx     # Individual post
│       └── components/
│           └── TagFilter.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── SectionWrapper.tsx
│   │   ├── AnimateOnScroll.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── LanguageProvider.tsx
│   │   └── BillingText.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── StatsBar.tsx
│       ├── Fleet.tsx
│       ├── ForPartners.tsx
│       ├── ForCustomers.tsx
│       ├── FAQ.tsx
│       └── CTAStrip.tsx
├── lib/
│   ├── content.ts              # DB helper functions (server-only)
│   └── env.ts                  # Typed env constants
├── public/
│   └── logo.svg
├── .env.example
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
├── vercel.json
├── DEPLOYMENT.md
└── README.md

apps/admin/app/(dashboard)/website-cms/
├── page.tsx
├── actions.ts
├── site-config/page.tsx
├── sections/page.tsx
├── sections/[slug]/page.tsx
└── blog/
    ├── page.tsx
    ├── new/page.tsx
    └── [id]/edit/page.tsx

packages/db/prisma/schema.prisma    # + SiteConfig, SiteSection, SiteBlock, BlogPost models
packages/db/src/seeds/website.seed.ts
```

---

## Notes for Cursor

- Always run `pnpm db:generate` after any schema change.
- Always run `pnpm check-types` before marking a phase done.
- Never hardcode strings — if you find yourself typing copy in JSX, stop and use BillingText with SiteBlock data.
- All monetary/pricing text is forbidden on this site — do not add it.
- The two CTAs (bookings and admin) must be present and visually prominent on every major section.
- Use Lucide React for all icons (already in monorepo).
- Respect the `revalidate = 3600` ISR pattern — do not use `force-dynamic` on public pages.
