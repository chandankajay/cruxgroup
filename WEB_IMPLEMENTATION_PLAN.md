# Crux Group - `apps/web` Implementation Plan

**Objective:** Build a high-converting, SEO-optimized, UI-native Next.js 16 marketing website for Crux Group (`www.cruxgroup.in`) within the existing monorepo. The site must serve as a dual-funnel for Customers (contractors) and Partners (fleet owners), utilizing the existing `packages/ui` and `packages/db` structures.

**Design Language:** * Primary Colors: Logo Blue and Logo Orange.
* Typography: Clean, modern sans-serif (Geist or Inter).
* Motion: Modern scroll transitions via `framer-motion`.
* Content Style: Punchy hooks, no walls of text.

---

## Phase 1: Scaffolding & Monorepo Integration
1. **Create App:** Initialize a Next.js 16 (App Router) project at `apps/web` using port `3002`.
2. **Dependencies:** Add `@repo/ui`, `@repo/db`, `@repo/api`, `@repo/tailwind-config`, `framer-motion`, `lucide-react`, and `next-mdx-remote` (for blogs).
3. **Tailwind Setup:** Ensure `apps/web` correctly imports the shared Tailwind v4 config and extends it with specific Crux Blue and Crux Orange hex codes extracted from the logo.
4. **Dictionary Setup:** Wire up the `DictionaryProvider` from `@repo/ui`. Create a new `DictionaryApp` enum value `WEB` in the Prisma schema (if required, or just use a generic fetcher) to pull localized strings for the landing page. Create a fallback `content.json` for initial dev.

## Phase 2: SEO, Metadata & Dynamic Content Config
1. **Metadata API:** Implement dynamic `generateMetadata` in `layout.tsx`. Ensure strong default keywords: "heavy equipment rental Telangana", "JCB rental", "crane booking".
2. **Service Area Targeting:** Create a dynamic array or Dictionary key for the active service belt: `["Shamshabad", "Kothur", "Shadnagar"]`. 
    * *Instruction:* Render this as a prominent, auto-scrolling ticker or badge on the hero section: *"Now actively serving: Shamshabad, Kothur, Shadnagar, and expanding rapidly."* This filters out irrelevant traffic immediately.
3. **Blog Architecture:** Set up an `app/blog/[slug]/page.tsx` route that reads local `.mdx` files from an `apps/web/content/blogs` directory. Ensure it generates static params for lightning-fast SEO.

## Phase 3: The "Dual-Path" Hero Section
1. **Layout:** Build a full-height (or 90vh) hero section using `framer-motion` for a smooth fade-and-slide-up entrance.
2. **Dynamic Headline:** "Empowering Rural Infrastructure & Construction."
3. **Dual CTAs (The Split):**
    * **Action 1 (Customers):** Solid Blue Button -> "Rent Equipment Now" -> routes to `https://bookings.cruxgroup.in`
    * **Action 2 (Partners):** Outline Orange Button -> "Attach Your Fleet" -> routes to `https://admin.cruxgroup.in/login`
4. **Trust Badges:** Add a small banner below CTAs: *"Verified Operators • Transparent Billing • Zero Hidden Costs"*

## Phase 4: The Partner "FOMO" Section (Fleet Owners)
1. **Section Goal:** Drive fleet owners to sign up by highlighting lost revenue.
2. **UI Pattern:** Dark mode section (Crux Blue background) to contrast with the rest of the site.
3. **Hooks (Dynamic text keys):**
    * *Headline:* "Your machines shouldn't be gathering dust."
    * *Subtext:* "Join the largest managed fleet network in Telangana. Get consistent bookings, manage operator payroll, and track earnings—all from your phone."
    * *Highlight Metric:* "Stop losing 40% of your potential billable hours to idle time."
4. **CTA:** "Become a Crux Partner" -> routes to `admin.cruxgroup.in` with a high-visibility hover state.

## Phase 5: The "Bento Box" Fleet Showcase
1. **Layout:** Build a modern CSS Grid (Bento Box style) showcasing available equipment. Avoid simple lists.
2. **Items to feature:** JCBs, Cranes, Dozers, Road Rollers, Post Hole Diggers, Excavators, and specialized Tractor attachments.
3. **Images:** Use realistic, high-quality placeholders for now. (Name the required assets in a `public/images/fleet/` folder structure so they can be replaced later with raw, ultra-real photography).
4. **Interactivity:** On hover, each grid item should gently scale up (`framer-motion`) and display a "Book Now" link pointing to the B2C bookings app.

## Phase 6: Footer & Centralized Contact 
1. **Contact Bar:** A sticky bottom mobile bar or prominent footer section with a "Call Us Today" button. Link the `href` to a centralized `tel:` link pulled from the DB/Config.
2. **Footer Links:** Quick links to `/blog`, `bookings`, `admin`, and the legal docs (reusing the markdown legal docs from the monorepo if possible).
3. **Signage Detail:** Ensure the corporate address section explicitly uses the Telugu script **"రిజిస్టర్డ్ ఆఫీస్"** alongside the English "Registered Office" label to maintain local authenticity and brand compliance.

## Execution Directives for Cursor AI
* Execute one Phase at a time.
* Do not break existing NextAuth proxy routing in `apps/admin`.
* Ensure all UI components are fully responsive (Mobile-first).
* Extract all user-facing strings into a `lib/constants/web-content.ts` temporarily, preparing them for the DB Dictionary migration.