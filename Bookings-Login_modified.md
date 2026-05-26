# Bookings Login — Surgical Fix (Colors + Logo + Desktop Layout)

> The previous prompt only changed text. This prompt fixes everything visual.
> Be explicit and surgical — override every style directly. Do not assume Tailwind classes are applying correctly; inspect the actual rendered output.

---

## Step 1 — Audit first (run this, report back before changing anything)

```
Before making any changes, do this audit and report findings:

1. Find the login page component files:
   Run: find apps/bookings/app/login -type f -name "*.tsx" -o -name "*.ts" | xargs ls -la
   List every file found.

2. For each .tsx file in apps/bookings/app/login/, show me the FULL file content:
   Run: cat apps/bookings/app/login/page.tsx
   And any other .tsx files in that directory or subdirectories.

3. Find the logo image file:
   Run: find apps/bookings/public -type f | head -20
   Report the filename and extension (is it .png, .jpg, .svg, .webp?)

4. Check current globals.css for the bookings app:
   Run: cat apps/bookings/app/globals.css
   Report what CSS variables and base styles exist.

5. Check if there is a tailwind.config in bookings app:
   Run: cat apps/bookings/tailwind.config.ts 2>/dev/null || cat apps/bookings/tailwind.config.js 2>/dev/null || echo "no tailwind config found"

6. Check the postcss config:
   Run: cat apps/bookings/postcss.config.mjs 2>/dev/null || cat apps/bookings/postcss.config.js 2>/dev/null

Report all findings. Do NOT make any changes yet.
```

---

## Step 2 — Fix globals.css first

```
Open apps/bookings/app/globals.css.

Add or replace the CSS custom properties and base styles with the following.
Do NOT remove any existing @tailwind directives or existing styles that are unrelated to colors/backgrounds.
ADD these at the top of the file after any @import or @tailwind lines:

:root {
  --brand-orange: #d45800;
  --brand-orange-hover: #ff7a2f;
  --brand-orange-glow: rgba(212, 88, 0, 0.18);
  --brand-dark: #0f0e0d;
  --brand-surface: #1a1917;
  --brand-surface-2: #222120;
  --brand-border: #2a2825;
  --brand-border-focus: #d45800;
  --brand-offwhite: #f5f0eb;
  --brand-muted: #9a9490;
  --brand-error: #ef4444;
}

* {
  box-sizing: border-box;
}

html, body {
  background-color: var(--brand-dark);
  color: var(--brand-offwhite);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--brand-dark); }
::-webkit-scrollbar-thumb { background: var(--brand-border); border-radius: 3px; }

/* Selection */
::selection { background: var(--brand-orange); color: white; }

After making this change, confirm the file was saved.
```

---

## Step 3 — Fix the logo (remove black box)

```
Find the logo rendering in the login page. It currently shows with a dark rectangular box around it.

Fix it with this exact approach:

1. Find where the logo <Image> or <img> is rendered in the login tsx file.

2. The parent container of the logo — remove ALL of these if present:
   - Any className containing: bg-, background, border, rounded, p- (padding that creates a box feel)
   - Any inline style with: background, backgroundColor, border, padding, borderRadius

3. The logo Image component itself:
   - If the logo file is a .png: it likely has a transparent background already. The black box is coming from a parent div. Remove the parent div's background.
   - If the logo file is a .jpg or .jpeg: JPG has no transparency. You must handle this differently:
     a. Add CSS to the Image element: style={{ mixBlendMode: 'lighten' }}
     b. This will make the black background of the JPG "disappear" against the dark page background
     c. The orange text and blue arc in the logo will show through correctly

4. Replace the logo container with exactly this:
   <div className="flex justify-center mb-6 mt-10">
     <Image
       src="/logo.png"  {/* or whatever the actual filename is */}
       alt="Crux Group"
       width={150}
       height={75}
       priority
       style={{ 
         mixBlendMode: 'lighten',
         objectFit: 'contain'
       }}
     />
   </div>

   If the logo IS an SVG (no black background issue): remove mixBlendMode, just use:
   style={{ objectFit: 'contain' }}

5. Verify: the logo should now show ONLY the orange text "CRUX GROUP", blue arc, and "AGRI & RURAL SERVICES" — with NO black rectangle around it.
```

---

## Step 4 — Responsive desktop layout

```
The page currently renders as a narrow mobile column even on desktop. Fix this with a proper responsive layout.

In the login page component, wrap the entire page with this structure:

/* The full-page wrapper */
<div 
  className="min-h-screen w-full relative flex"
  style={{ backgroundColor: 'var(--brand-dark)' }}
>

  {/* Background image layer — full screen */}
  {/* Keep the existing background image if there is one, or add this: */}
  <div 
    className="fixed inset-0 z-0"
    style={{
      backgroundImage: 'url(/hero-excavator.jpg)', /* use whatever bg image exists */
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
  {/* Dark overlay */}
  <div 
    className="fixed inset-0 z-0"
    style={{ background: 'linear-gradient(to bottom, rgba(15,14,13,0.85) 0%, rgba(15,14,13,0.75) 50%, rgba(15,14,13,0.92) 100%)' }}
  />

  {/* MOBILE layout: single centered column (default, up to md breakpoint) */}
  {/* DESKTOP layout: two columns at md+ */}

  {/* Left panel — visible only on desktop (md+) */}
  <div className="hidden md:flex flex-col justify-center px-16 w-1/2 relative z-10">
    {/* Logo */}
    <div className="mb-10">
      <Image src="/logo.png" alt="Crux Group" width={180} height={90} priority style={{ mixBlendMode: 'lighten', objectFit: 'contain' }} />
    </div>
    {/* Big headline for desktop left panel */}
    <h1 style={{ 
      fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
      fontWeight: 800, 
      lineHeight: 1.1, 
      letterSpacing: '-0.02em',
      color: 'var(--brand-offwhite)'
    }}>
      <span style={{ color: 'var(--brand-orange)' }}>Book</span> Your Equipment.<br />
      Built for Builders.
    </h1>
    <p style={{ color: 'var(--brand-muted)', fontSize: '1.1rem', marginTop: '1rem', maxWidth: '420px' }}>
      Telangana's most trusted heavy equipment platform. JCBs, Cranes, Excavators — on demand.
    </p>
    {/* Feature list */}
    <ul style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[
        { icon: '✓', text: 'Verified machines & trained operators' },
        { icon: '✓', text: 'Book in under 2 minutes' },
        { icon: '✓', text: 'Available across Telangana' },
      ].map((item) => (
        <li key={item.text} style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--brand-muted)', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>{item.icon}</span>
          {item.text}
        </li>
      ))}
    </ul>
  </div>

  {/* Right panel — login form (full width on mobile, half on desktop) */}
  <div className="flex flex-col justify-center items-center w-full md:w-1/2 relative z-10 px-5 py-10 min-h-screen">

    {/* Logo — mobile only */}
    <div className="flex justify-center mb-6 md:hidden">
      <Image src="/logo.png" alt="Crux Group" width={140} height={70} priority style={{ mixBlendMode: 'lighten', objectFit: 'contain' }} />
    </div>

    {/* Mobile headline — hidden on desktop */}
    <div className="text-left w-full max-w-sm mb-6 md:hidden">
      <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--brand-offwhite)' }}>
        <span style={{ color: 'var(--brand-orange)' }}>Book</span> Your Equipment.<br />
        Built for Builders.
      </h1>
      <p style={{ color: 'var(--brand-muted)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
        Telangana's most trusted heavy equipment platform.
      </p>
    </div>

    {/* THE EXISTING LOGIN FORM CARD — place it here, restyled per Step 5 below */}
    {/* ... existing form component ... */}

  </div>

</div>

IMPORTANT: The existing login form logic (phone input, OTP input, server actions, error handling, lockout) stays exactly as-is. Only wrap it in this new layout structure and restyle the card (Step 5).
```

---

## Step 5 — Restyle the login card and inputs (inline styles — no Tailwind assumptions)

```
Find the card/form container in the login component. Apply these styles using inline style props so they definitely take effect regardless of Tailwind configuration.

CARD CONTAINER (the div wrapping the form):
style={{
  backgroundColor: '#1a1917',
  border: '1px solid #2a2825',
  borderRadius: '16px',
  padding: '28px 24px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 0 0 1px rgba(212,88,0,0.06), 0 24px 64px rgba(0,0,0,0.6)',
}}

CARD LABEL ("YOUR WHATSAPP NUMBER" or "Your WhatsApp Number"):
style={{
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#9a9490',
  marginBottom: '10px',
  display: 'block',
}}

PHONE INPUT ROW CONTAINER (wraps +91 and the input together):
style={{
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#0f0e0d',
  border: '1.5px solid #2a2825',
  borderRadius: '10px',
  height: '54px',
  overflow: 'hidden',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
}}
Add onFocus: border-color '#d45800', box-shadow '0 0 0 3px rgba(212,88,0,0.15)'
Add onBlur: reset to original

"+91" prefix div:
style={{
  padding: '0 14px',
  color: '#f5f0eb',
  fontSize: '1rem',
  fontWeight: 600,
  borderRight: '1px solid #2a2825',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  backgroundColor: '#1a1917',
}}

Phone number input element:
style={{
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#f5f0eb',
  fontSize: '1.05rem',
  padding: '0 14px',
  height: '100%',
  letterSpacing: '0.05em',
}}

GET OTP BUTTON:
style={{
  width: '100%',
  height: '54px',
  background: 'linear-gradient(135deg, #d45800 0%, #b84a00 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.95rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  marginTop: '14px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}}
Add onMouseEnter: background 'linear-gradient(135deg, #ff7a2f 0%, #d45800 100%)', transform 'scale(1.01)'
Add onMouseLeave: reset
Add onMouseDown: transform 'scale(0.99)'

HELPER TEXT ("We'll send a one-time code on WhatsApp"):
style={{
  color: '#9a9490',
  fontSize: '0.76rem',
  textAlign: 'center',
  marginTop: '10px',
}}

TRUST BADGES ROW (the 3 icons + labels):
Container:
style={{
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '1px solid #2a2825',
}}

Each badge:
style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
}}

Each badge icon (Lucide icons):
- Size: 20
- Color: '#d45800'  ← THIS IS THE KEY CHANGE — make them orange not grey

Each badge label:
style={{
  fontSize: '0.7rem',
  color: '#9a9490',
  textAlign: 'center',
}}

DEV OTP NOTICE (if visible):
style={{
  backgroundColor: 'rgba(212,88,0,0.1)',
  border: '1px solid rgba(212,88,0,0.25)',
  borderRadius: '8px',
  padding: '8px 12px',
  marginBottom: '16px',
  fontSize: '0.82rem',
  fontFamily: 'monospace',
  color: '#d45800',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}

TERMS LINKS:
style={{
  color: '#9a9490',
  fontSize: '0.72rem',
  textDecoration: 'none',
}}
Add hover: textDecoration 'underline'
```

---

## Step 6 — Handle focus state on phone input row (client component)

```
The phone input row needs a focus glow effect. Since CSS :focus-within won't work easily with inline styles, implement it with React state:

In the login form component (or wherever the phone input lives):

Add state: const [phoneFocused, setPhoneFocused] = useState(false)

On the phone input row container div, change the border and shadow based on state:
style={{
  ...baseStyles,
  borderColor: phoneFocused ? '#d45800' : '#2a2825',
  boxShadow: phoneFocused ? '0 0 0 3px rgba(212,88,0,0.15)' : 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
}}

On the input element:
onFocus={() => setPhoneFocused(true)}
onBlur={() => setPhoneFocused(false)}

This is a "use client" change — make sure the component using this state is already a client component (has "use client" at top). If not, extract only the form portion into a separate client component.
```

---

## Step 7 — Final check

```
After all changes:

1. Run: pnpm check-types --filter=@repo/bookings
   Fix ALL TypeScript errors before finishing.

2. Start the dev server: pnpm dev --filter=@repo/bookings

3. Check in browser at these viewports:
   - 375px (iPhone SE): should look like a well-designed mobile login, single column
   - 768px (iPad): should start showing two-column layout
   - 1280px (desktop): left panel with big headline, right panel with login form

4. Verify these specific things are fixed:
   [ ] Logo has NO black/dark rectangle box around it
   [ ] Background image is visible (atmospheric, not fully hidden)
   [ ] Card has dark surface color (#1a1917) with subtle border
   [ ] GET OTP button is a rich orange gradient (NOT flat brown)
   [ ] Trust badge icons are ORANGE (#d45800), not grey
   [ ] Phone input has orange border + glow when focused
   [ ] On desktop: two-column layout — left = headline/features, right = form
   [ ] On mobile: single column, logo on top, headline, then card
   [ ] No content is cut off or squeezed on desktop

5. If the logo black box is STILL showing after Step 3:
   Run: file apps/bookings/public/logo* (or whatever the logo filename is)
   If it says "JPEG" or "PNG with no alpha": the image itself has a black background baked in.
   Solution: open the image URL in browser, right-click, "open in new tab" — if you see a black background, confirm this.
   Then apply: style={{ mixBlendMode: 'lighten' }} on the Image component — this WILL fix it.
   If it already has mixBlendMode applied and still shows: try filter: 'brightness(1.1)' instead.
```

---

## Summary of what each step fixes

| Step | Fixes |
|------|-------|
| 1 | Audit — understand exactly what code exists before changing it |
| 2 | globals.css — CSS variables that all components can use |
| 3 | Logo — removes black rectangle box |
| 4 | Desktop layout — two-column responsive split, not squeezed |
| 5 | All inline styles — card, input, button, badges (guaranteed to apply) |
| 6 | Focus state — orange glow on phone input |
| 7 | Verification checklist |

## Why inline styles instead of Tailwind classes?

The previous prompt used Tailwind class names which didn't apply — likely because:
- The Tailwind config in apps/bookings doesn't have the brand colors registered
- Or Tailwind v4's @theme block isn't set up in this app yet
- Or class names were being overridden by existing styles

Inline styles bypass all of this and are guaranteed to apply. Once the visual is confirmed working, a follow-up can migrate to Tailwind classes if desired.