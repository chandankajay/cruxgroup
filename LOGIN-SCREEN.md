# Bookings App — Login Screen Visual Overhaul

> Target file: `apps/bookings/app/login/page.tsx` and related components.
> Do NOT change any auth logic, OTP flow, server actions, or NextAuth configuration.
> Only touch UI/visual layer. All functional behaviour stays identical.

---

## Context: What exists

The current login page has:
- A logo image with a black box background (not transparent)
- A headline "Powering Your Projects"
- A subtitle about the largest heavy machinery fleet
- A card with: "WHATSAPP NUMBER" label, +91 phone input, "GET OTP" button
- An OTP entry step (second screen after phone submission)
- Three trust badges: Verified Fleet, 2hr Response, 50km Coverage
- Terms and Privacy links
- A blurred construction site background image

**Auth flow to preserve exactly:**
- Step 1: User enters phone → submits → OTP sent via WhatsApp
- Step 2: OTP input → verify → redirect to home
- Lockout state when too many attempts
- Dev OTP display in development mode
- All server actions, error states, loading states — untouched

---

## Brand tokens (match the website — apps/website)

```css
--brand-orange: #d45800;
--brand-orange-hover: #ff7a2f;
--brand-dark: #0f0e0d;
--brand-surface: #1a1917;
--brand-border: #2a2825;
--brand-offwhite: #f5f0eb;
--brand-muted: #9a9490;
--brand-blue: #3b82f6; /* from logo's blue arc */
```

Logo colors extracted: **Orange #d45800** (brand name), **Blue #1d6fa4** (arc/ring), black background (must be removed — use transparent PNG or next/image with proper background handling).

---

## Step 1 — Fix the logo

```
In apps/bookings/app/login/page.tsx (or wherever the logo is rendered):

1. The logo currently shows with a black rectangle box. Fix this:
   - Check if the logo file is a PNG with transparency or a JPG with black background
   - Run: ls apps/bookings/public/ and find the logo file
   - If it's a JPG (no transparency): wrap the next/image in a div with background: transparent and add CSS mix-blend-mode: lighten OR use the logo from apps/website/public/logo.svg if it's SVG
   - If it's already a PNG: ensure the parent div does NOT have a background-color set
   - Remove any border, border-radius, or background on the logo container div

2. Logo sizing on mobile login screen:
   - Max width: 160px (not 380px as it appears now — too large for a login screen)
   - Centered horizontally
   - Do not add any box, card, or container around the logo
```

---

## Step 2 — Full login page redesign

```
Redesign apps/bookings/app/login/page.tsx visually. Preserve all functional logic exactly.

TARGET FEEL: A premium construction-tech app. Dark, earthy, confident. Like opening Uber or Swiggy but for heavy machinery. Every builder in Telangana should feel this is serious, fast, and made for them.

---

### Background treatment:
- Keep the existing background image (construction site / machinery)
- Add a stronger gradient overlay: 
  linear-gradient(to bottom, rgba(15,14,13,0.88) 0%, rgba(15,14,13,0.75) 40%, rgba(15,14,13,0.92) 100%)
- This makes the background atmospheric rather than washed out
- The background image should cover the full screen (object-fit: cover, position: fixed)

---

### Layout structure (mobile-first, single column):

Replace the current layout with this visual hierarchy:

```
┌─────────────────────────────┐
│                             │  ← full screen, bg image with overlay
│    [LOGO — transparent]     │  ← 160px wide, centered, mt-12
│                             │
│  Book Your Equipment.       │  ← H1, large, bold, left-aligned or centered
│  Built for Builders.        │  ← orange word on first line ("Book" = orange)
│                             │
│  Telangana's most trusted   │  ← subtitle, muted, small
│  heavy equipment platform.  │
│                             │
│ ┌─────────────────────────┐ │
│ │  Enter your WhatsApp    │ │  ← Card: dark surface, subtle border
│ │  number to get started  │ │
│ │                         │ │
│ │  [+91] [phone input   ] │ │  ← Input: clean, large tap target
│ │                         │ │
│ │  [  GET OTP →         ] │ │  ← Button: full-width, orange, bold
│ │                         │ │
│ │  You'll receive a code  │ │  ← Helper text, muted, small
│ │  on WhatsApp            │ │
│ └─────────────────────────┘ │
│                             │
│  ✓ Verified Fleet           │  ← Trust row: horizontal, icon + text
│  ⏱ 2hr Response             │
│  📍 Telangana Coverage      │
│                             │
│  Terms · Privacy            │  ← Footer links, muted, tiny
└─────────────────────────────┘
```

---

### Typography:

H1 headline — change from "Powering Your Projects" to a two-liner:
Line 1: `Book Your Equipment.` ← "Book" in brand orange (#d45800), rest in off-white
Line 2: `Built for Builders.` ← all off-white

Font size: clamp(2rem, 7vw, 2.8rem) — large enough to feel premium, not overwhelming
Font weight: 800 (extrabold)
Letter spacing: -0.02em (tight, modern)

Subtitle below H1:
Text: "Telangana's most trusted heavy equipment platform."
Color: #9a9490 (muted)
Size: 0.9rem
Margin: 0.5rem top, 1.5rem bottom

---

### OTP card redesign:

Background: #1a1917 (dark surface)
Border: 1px solid #2a2825
Border-radius: 16px
Padding: 24px
Box-shadow: 0 0 0 1px rgba(212,88,0,0.08), 0 20px 60px rgba(0,0,0,0.5)

Card header text (replace "WHATSAPP NUMBER"):
Label: "Your WhatsApp Number"
Style: font-size 0.75rem, letter-spacing 0.08em, color #9a9490, font-weight 600, uppercase

Phone input row:
- Left: "+91" in a dark pill (background: #2a2825, color: #f5f0eb, padding: 12px 14px, border-right: 1px solid #2a2825)
- Right: number input (background: transparent, color: #f5f0eb, font-size: 1.1rem, no border, padding: 14px)
- Wrap both in a single container: background #0f0e0d, border: 1.5px solid #2a2825, border-radius: 10px, height: 54px
- On focus: border-color: #d45800, box-shadow: 0 0 0 3px rgba(212,88,0,0.15)
- Transition: all 0.2s ease

GET OTP button:
- Full width
- Height: 54px
- Background: linear-gradient(135deg, #d45800 0%, #b84a00 100%)
- Color: white
- Font: 0.95rem, font-weight: 700, letter-spacing: 0.05em
- Border-radius: 10px
- No border
- Hover: background shifts to #ff7a2f, subtle scale(1.01)
- Active: scale(0.99)
- Loading state: replace text with a spinner (3 animated dots or a simple rotate icon)
- Transition: all 0.2s ease

Helper text below button:
"We'll send a one-time code on WhatsApp"
Color: #9a9490, font-size: 0.78rem, text-align: center, margin-top: 10px

---

### OTP entry step (second screen — after phone submitted):

Apply the same card styling.

Header: 
- Back arrow (←) on left, tappable, goes back to phone step
- "Verify OTP" as card title (same style as phone label)

Body:
- Text: "Code sent to +91 XXXXXXXXXX" — show last 4 digits of phone, rest masked
- OTP input: large, centered, letter-spacing: 0.3em, font-size: 1.5rem, text-align: center
  OR if using 6 individual digit boxes: each box 44x54px, dark surface, orange border on focus
- "Verify" button: same orange button style
- "Resend OTP" link below: muted, underline on hover, disabled countdown timer ("Resend in 30s")

If OTP boxes are individual digits: implement autofocus-next on each digit input and paste handling.

---

### Trust badges redesign:

Remove the current faint icon + text grid.

Replace with a horizontal scrollable strip (on mobile) or a 3-column row:

Each badge:
```
[icon]
label
```
- Container: no background, just spaced items
- Icon: Lucide icon, 20px, color #d45800 (orange — make them pop)
- Label: 0.72rem, color #9a9490, margin-top: 4px
- Items: "Verified Fleet", "2hr Response", "Pan Telangana"

---

### Dev OTP display (development mode):

If `NEXT_PUBLIC_NODE_ENV === "development"` and a static OTP is shown:
Style it as a subtle amber toast-style notice at the top of the card:
- Background: rgba(212,88,0,0.12)
- Border: 1px solid rgba(212,88,0,0.3)
- Border-radius: 8px
- Padding: 8px 12px
- Text: "Dev OTP: 4242" in #d45800
- Font: monospace, 0.85rem

---

### Lockout state:

When user is locked out:
- Show an alert card inside the OTP card area
- Background: rgba(239,68,68,0.1), border: 1px solid rgba(239,68,68,0.3)
- Icon: lock icon (Lucide), red
- Text: "Too many attempts. Try again after X minutes."
- Disable both inputs and buttons

---

### Error states:

All error messages:
- Appear below the relevant input (not above the card)
- Style: color #ef4444, font-size: 0.78rem, display flex, gap 4px, align-items center
- Icon: Lucide AlertCircle, 14px, same red color
- Animate in: opacity 0→1, translateY -4px→0, 0.2s ease

---

### Footer links:

"Terms and Conditions · Privacy Policy"
- Color: #9a9490 (muted, not orange)
- Font-size: 0.72rem
- Underline on hover only
- Centered
- Margin-top: auto (push to bottom of flex container)

---

### Animations (use framer-motion — already in project):

Page load sequence (staggered):
1. Logo: fadeIn, delay 0ms
2. H1: fadeUp (y: 20→0, opacity 0→1), delay 100ms
3. Subtitle: fadeUp, delay 200ms
4. Card: scaleIn (scale 0.96→1, opacity 0→1), delay 300ms
5. Trust badges: fadeUp, delay 400ms

Phone → OTP transition:
- When phone is submitted and OTP step appears:
  AnimatePresence with exit: { x: -30, opacity: 0 } and enter: { x: 30, opacity: 0 } → { x: 0, opacity: 1 }
  Duration: 0.3s, ease: [0.16, 1, 0.3, 1]
- This makes the step transition feel like navigating forward in a mobile app

All animations must respect: `@media (prefers-reduced-motion: reduce)` — skip transforms, keep opacity only.

---

### Implementation rules:

1. Do NOT change: any server action, auth logic, OTP verification, lockout logic, WhatsApp API calls, NextAuth config, redirect behaviour, or any file outside apps/bookings/app/login/.
2. Use Tailwind CSS classes where possible; use inline style only for values Tailwind can't express (e.g. clamp(), complex gradients, CSS custom properties).
3. Use Lucide React for all icons (already in project) — do NOT install new icon libraries.
4. Use next/image for logo with proper width/height props.
5. Keep the existing component structure (if login is split into LoginForm, OtpForm etc) — just restyle each one.
6. After changes: run `pnpm check-types --filter=@repo/bookings` and fix all TypeScript errors.
7. Test in Chrome DevTools at 375px (iPhone SE) and 390px (iPhone 14) viewport widths.

---

### After implementing, verify this checklist:

- [ ] Logo has NO black box / rectangle around it
- [ ] Background image is visible and atmospheric (not washed out, not too dark to see)
- [ ] "Book" in H1 is brand orange (#d45800), rest is off-white
- [ ] Phone input has orange focus ring
- [ ] OTP button is a rich orange gradient, full width
- [ ] OTP step has back arrow + masked phone number display
- [ ] Trust badges icons are orange
- [ ] Error messages appear below input with red icon
- [ ] Lockout state shows distinct locked UI
- [ ] Dev OTP shows styled amber notice (in dev only)
- [ ] Page load has staggered animation
- [ ] Phone→OTP transition slides correctly
- [ ] No horizontal scroll at 375px viewport
- [ ] All tap targets ≥ 44px height on mobile
- [ ] `pnpm check-types` passes with no errors
```

---

## What NOT to touch

| File/Area | Reason |
|-----------|--------|
| `apps/bookings/lib/auth.ts` | Auth logic |
| `apps/bookings/app/api/auth/**` | NextAuth routes |
| `apps/bookings/app/api/auth/send-otp/**` | OTP delivery |
| `apps/bookings/app/api/auth/verify-otp/**` | OTP verification |
| Any server action that calls WhatsApp / AiSensy | Backend integrations |
| `apps/bookings/app/(home)/` | Home page (separate task) |
| `packages/api/` | tRPC layer |
| `packages/db/` | Database |

Only touch files under `apps/bookings/app/login/` and any shared UI components it imports that are local to the bookings app.