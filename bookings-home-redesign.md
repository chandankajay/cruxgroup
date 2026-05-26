# Bookings App — Home Screen Visual Overhaul

> Target: `apps/bookings/app/(home)/` — the authenticated home/equipment listing screen.
> Theme: White, Blue (#1d6fa4), Orange (#d45800) — clean, light, professional. iOS-feel on mobile.
> DO NOT touch: equipment data fetching, search logic, booking actions, auth, tRPC calls.
> ONLY touch: layout, navigation, card design, colors, typography, image placeholders.

---

## Step 1 — Audit (run first, report before changing)

```
Audit the home screen files before making any changes.

1. List all files in the home route:
   Run: find apps/bookings/app -type f \( -name "*.tsx" -o -name "*.ts" \) | grep -v node_modules | sort
   Report the full tree.

2. Show the layout file:
   Run: cat apps/bookings/app/layout.tsx
   And: cat apps/bookings/app/(home)/layout.tsx 2>/dev/null || echo "no home layout"

3. Show the home page:
   Run: cat apps/bookings/app/(home)/page.tsx 2>/dev/null || cat apps/bookings/app/page.tsx

4. Find the header/navbar component:
   Run: grep -r "My bookings\|Profile\|navbar\|header\|Header\|Navbar" apps/bookings/app --include="*.tsx" -l
   Then cat each file found.

5. Find the equipment card component:
   Run: grep -r "Book Now\|EquipmentCard\|equipment-card" apps/bookings --include="*.tsx" -l
   Then cat each file found.

6. Find where the grey header background is set:
   Run: grep -r "bg-gray\|bg-slate\|bg-neutral\|background.*gray\|#[89a-f][0-9a-f][89a-f]" apps/bookings/app --include="*.tsx" -i | head -20

7. Check if framer-motion is in bookings package.json:
   Run: cat apps/bookings/package.json | grep framer

Report all findings. Do NOT make any changes yet.
```

---

## Step 2 — Design tokens (add to globals.css)

```
Open apps/bookings/app/globals.css. Add these CSS variables after existing content:

:root {
  /* Brand */
  --c-orange: #d45800;
  --c-orange-light: #fff0e8;
  --c-orange-hover: #b84a00;
  --c-orange-glow: rgba(212,88,0,0.12);
  --c-blue: #1d6fa4;
  --c-blue-light: #e8f2fa;
  --c-blue-hover: #155d8a;

  /* Light theme (home screen) */
  --c-bg: #f8f9fa;
  --c-surface: #ffffff;
  --c-surface-2: #f1f5f9;
  --c-border: #e2e8f0;
  --c-border-strong: #cbd5e1;
  --c-text: #0f172a;
  --c-text-secondary: #475569;
  --c-text-muted: #94a3b8;

  /* Nav */
  --c-nav-bg: #ffffff;
  --c-nav-border: #e2e8f0;
  --c-nav-height: 64px;
  --c-bottom-nav-height: 68px;
}

/* Override body for home screen light theme */
body {
  background-color: var(--c-bg);
  color: var(--c-text);
}

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Remove scrollbar on mobile */
@media (max-width: 768px) {
  body { -webkit-overflow-scrolling: touch; }
}
```

---

## Step 3 — Header / Navbar redesign

```
Find the header/navbar component for the bookings home screen.
Replace its styling completely with the following. Preserve all navigation logic and links.

The new header has TWO modes:
- MOBILE (< 768px): hidden — replaced by bottom tab bar (Step 4)
- DESKTOP (≥ 768px): fixed top bar with logo, nav links, and hamburger for side drawer

DESKTOP HEADER:

<header style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '64px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}}>

  {/* Logo */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Image
      src="/logo.png"  {/* actual logo filename */}
      alt="Crux Group"
      width={130}
      height={65}
      style={{ objectFit: 'contain', mixBlendMode: 'multiply' }}
      {/* mixBlendMode multiply: on white background, black pixels disappear, logo colors show perfectly */}
    />
  </div>

  {/* Desktop nav links — hidden on mobile */}
  <nav className="hidden md:flex" style={{ gap: '32px', alignItems: 'center' }}>
    <NavLink href="/" label="Equipment" />
    <NavLink href="/dashboard" label="My Bookings" />
    <NavLink href="/profile" label="Profile" />
  </nav>

  {/* Hamburger — desktop only, opens side drawer */}
  <button
    className="hidden md:flex"
    onClick={toggleSidebar}
    style={{
      width: '40px', height: '40px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    aria-label="Menu"
  >
    <Menu size={20} color="#475569" />
  </button>

</header>

NavLink component (inline):
const NavLink = ({ href, label }) => (
  <a href={href} style={{
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#475569',
    textDecoration: 'none',
    padding: '4px 0',
    borderBottom: '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
  }}
  onMouseEnter={e => { e.target.style.color = '#d45800'; e.target.style.borderBottomColor = '#d45800'; }}
  onMouseLeave={e => { e.target.style.color = '#475569'; e.target.style.borderBottomColor = 'transparent'; }}
  >
    {label}
  </a>
)

On mobile: the entire header is hidden (display: none below 768px).
Mobile navigation is handled by the bottom tab bar in Step 4.

Add top padding to the page content: paddingTop 64px on desktop, 0 on mobile (bottom nav doesn't need top offset).
Add bottom padding to the page content: 0 on desktop, 80px on mobile (for bottom nav).
```

---

## Step 4 — Mobile Bottom Tab Bar (iOS feel)

```
Create a new component: apps/bookings/components/BottomNav.tsx

This is a CLIENT COMPONENT ("use client"). 
It renders ONLY on mobile (hidden on md+ screens).
It uses framer-motion for the active tab indicator animation.

import { motion } from 'framer-motion'
import { Home, ClipboardList, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const tabs = [
  { href: '/',          icon: Home,          label: 'Equipment' },
  { href: '/dashboard', icon: ClipboardList,  label: 'My Bookings' },
  { href: '/profile',   icon: User,           label: 'Profile' },
]

FULL COMPONENT:

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '68px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',  /* iPhone notch support */
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              flex: 1,
              padding: '8px 0',
              position: 'relative',
            }}
          >
            {/* Active indicator pill behind icon */}
            {isActive && (
              <motion.div
                layoutId="bottomNavIndicator"
                style={{
                  position: 'absolute',
                  top: '6px',
                  width: '40px',
                  height: '32px',
                  backgroundColor: 'rgba(212,88,0,0.1)',
                  borderRadius: '10px',
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <Icon
              size={22}
              style={{
                position: 'relative',
                zIndex: 1,
                color: isActive ? '#d45800' : '#94a3b8',
                transition: 'color 0.2s',
              }}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span style={{
              fontSize: '0.65rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#d45800' : '#94a3b8',
              letterSpacing: '0.01em',
              transition: 'color 0.2s',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

Add <BottomNav /> to apps/bookings/app/layout.tsx (or the home layout).
It will auto-hide on desktop via className="md:hidden".

The framer-motion layoutId="bottomNavIndicator" creates a smooth sliding pill 
that animates between tabs when the user navigates — this is the iOS feel.
```

---

## Step 5 — Desktop Side Drawer

```
Create: apps/bookings/components/SideDrawer.tsx

"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, ClipboardList, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

Props: { isOpen: boolean; onClose: () => void }

RENDER:
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(2px)',
        }}
      />
      {/* Drawer panel — slides in from right */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '300px',
          backgroundColor: '#ffffff',
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Drawer header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Image src="/logo.png" alt="Crux Group" width={110} height={55} style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="#475569" />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { href: '/', icon: Home, label: 'Equipment' },
            { href: '/dashboard', icon: ClipboardList, label: 'My Bookings' },
            { href: '/profile', icon: User, label: 'Profile' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '10px',
              textDecoration: 'none', marginBottom: '4px',
              color: '#475569', fontSize: '0.95rem', fontWeight: 500,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff0e8'; e.currentTarget.style.color = '#d45800'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out at bottom */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={/* existing sign out handler */}
            style={{
              width: '100%', padding: '10px 16px',
              border: '1px solid #e2e8f0', borderRadius: '10px',
              background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              color: '#ef4444', fontSize: '0.9rem', fontWeight: 500,
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

Wire the hamburger button in the header to toggle this drawer:
In the header component add: const [sidebarOpen, setSidebarOpen] = useState(false)
Pass setSidebarOpen to the hamburger onClick.
Add <SideDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> after the header.
```

---

## Step 6 — Page header section redesign

```
Find the "Available Equipment" heading section at the top of the home page.
Currently it has: blue H1, grey subtitle, on a dark background with a white search bar below.

Replace with:

<section style={{
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  padding: '24px 24px 0 24px',
}}>
  {/* Greeting + heading */}
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d45800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
      Telangana's Equipment Network
    </p>
    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
      Available Equipment
    </h1>
    <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
      Book construction equipment in minutes
    </p>

    {/* Search bar */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#f8f9fa',
      border: '1.5px solid #e2e8f0',
      borderRadius: '12px',
      padding: '0 16px',
      height: '50px',
      marginBottom: '0',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
    onFocus... /* wrap in a FocusWithin client component OR use CSS :focus-within */
    >
      <Search size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
      {/* existing search input — keep logic, restyle only */}
      {/* input style: background transparent, border none, outline none, flex 1, color #0f172a, fontSize 0.95rem */}
    </div>

    {/* Category filter chips — horizontal scroll on mobile */}
    {/* If category filters exist, render them here as pills: */}
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '14px 0',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* "All" chip */}
      <FilterChip label="All" active={true} />
      <FilterChip label="JCB" active={false} />
      <FilterChip label="Crane" active={false} />
      <FilterChip label="Excavator" active={false} />
      <FilterChip label="Dozer" active={false} />
    </div>
  </div>
</section>

FilterChip component:
const FilterChip = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '6px 16px',
    borderRadius: '20px',
    border: active ? '1.5px solid #d45800' : '1.5px solid #e2e8f0',
    backgroundColor: active ? '#fff0e8' : '#ffffff',
    color: active ? '#d45800' : '#475569',
    fontSize: '0.82rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  }}>
    {label}
  </button>
)
```

---

## Step 7 — Equipment card redesign

```
Find the equipment card component. Redesign it completely.
Preserve: all props, click handlers, booking logic, data fields.
Change: all visual styling.

CARD CONTAINER:
style={{
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  cursor: 'pointer',
}}
onMouseEnter: boxShadow '0 8px 24px rgba(0,0,0,0.1)', transform 'translateY(-2px)'
onMouseLeave: reset

IMAGE AREA (top of card, fixed height):
style={{
  width: '100%',
  height: '180px',
  position: 'relative',
  backgroundColor: '#f1f5f9',  /* clean grey placeholder instead of peach */
  overflow: 'hidden',
}}

For the image placeholder (when no image URL / broken image):
Do NOT show "B(" or "CH" — these are broken emoji/icon initials.
Replace with a proper placeholder:

const getCategoryIcon = (category: string) => {
  const map = {
    'Crane': '🏗️',
    'JCB': '🚜',
    'Excavator': '⛏️',
    'Dozer': '🚧',
    'Harvester': '🌾',
    'Agriculture': '🌾',
    'Earthmoving': '🚜',
  }
  return map[category] || '🏗️'
}

Placeholder div (when no image):
<div style={{
  width: '100%', height: '100%',
  backgroundColor: '#f1f5f9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}}>
  <span style={{ fontSize: '2.5rem' }}>{getCategoryIcon(category)}</span>
  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{category}</span>
</div>

When image exists: use next/image with fill, objectFit cover.

CARD BODY:
style={{ padding: '14px 16px 16px' }}

Equipment name:
style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}

Category badge (top right of card, absolute positioned over image):
style={{
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(4px)',
  borderRadius: '20px',
  padding: '3px 10px',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#1d6fa4',
  border: '1px solid rgba(29,111,164,0.2)',
}}

SPECS (fix the camelCase key bug):
Currently showing raw keys like "liftingCapacity:", "bladeCapacity:" — fix this.

Create a label map:
const specLabels: Record<string, string> = {
  liftingCapacity: 'Lifting',
  boomLength: 'Boom',
  power: 'Power',
  bladeCapacity: 'Blade',
  trackType: 'Track',
  cutterBarWidth: 'Cutter',
  grainTank: 'Grain Tank',
  // add more as needed
}

Render specs as:
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
  {Object.entries(specs).slice(0, 3).map(([key, value]) => (
    <span key={key} style={{
      fontSize: '0.72rem',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      borderRadius: '6px',
      padding: '2px 8px',
      fontWeight: 500,
    }}>
      {specLabels[key] ?? key}: <strong style={{ color: '#0f172a' }}>{value}</strong>
    </span>
  ))}
</div>

CARD FOOTER (price + button row):
style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}

Price:
<div>
  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d45800' }}>₹{price}</span>
  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>/day</span>
</div>

Book Now button:
style={{
  backgroundColor: '#d45800',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '8px 18px',
  fontSize: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 0.15s, transform 0.1s',
}}
onMouseEnter: backgroundColor '#b84a00'
onMouseLeave: reset
onMouseDown: transform 'scale(0.97)'
onMouseUp: reset

CARD GRID:
The grid wrapping all cards:
style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
  padding: '20px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
}}

On mobile (< 480px): gridTemplateColumns: '1fr' (single column)
On tablet (480px–768px): gridTemplateColumns: 'repeat(2, 1fr)'
On desktop (768px+): repeat(auto-fill, minmax(300px, 1fr))
```

---

## Step 8 — Card entrance animations (framer-motion)

```
If framer-motion is available in apps/bookings (check package.json):

Wrap the equipment grid with a stagger container:

import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
  style={{ /* grid styles */ }}
>
  {equipment.map((item) => (
    <motion.div key={item.id} variants={cardVariants}>
      <EquipmentCard {...item} />
    </motion.div>
  ))}
</motion.div>

This creates a staggered card entrance — each card pops in 70ms after the previous.
Very clean, very iOS-feel.

If framer-motion is NOT in apps/bookings/package.json:
  Run: pnpm add framer-motion --filter=@repo/bookings
  Then apply the above.

Respect prefers-reduced-motion:
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  If true: set initial="show" to skip the animation entirely.
```

---

## Step 9 — Final checks

```
After all changes:

1. Run: pnpm check-types --filter=@repo/bookings
   Fix ALL TypeScript errors.

2. Check at these viewports in browser:

   375px (iPhone SE):
   [ ] NO top header visible — replaced by bottom tab bar
   [ ] Bottom tab bar shows: Equipment, My Bookings, Profile
   [ ] Active tab has orange icon + orange pill background
   [ ] Cards are single column, full width with proper padding
   [ ] Search bar is usable (not too small, not cut off)
   [ ] Category filter chips scroll horizontally
   [ ] No content hidden under bottom tab bar (80px bottom padding)

   768px (iPad):
   [ ] Top header visible with logo + nav links + hamburger
   [ ] Bottom tab bar hidden
   [ ] Cards in 2-column grid

   1280px (desktop):
   [ ] Header: white background (NOT grey), Crux Group logo, nav links, hamburger
   [ ] Hamburger opens side drawer from right
   [ ] Cards in 3-4 column grid
   [ ] No horizontal scroll
   [ ] No content squeezed

   All viewports:
   [ ] Logo has NO black box (mixBlendMode: multiply on white background)
   [ ] Equipment placeholders show emoji + category name (NOT "B(" or "CH")
   [ ] Spec labels show human-readable names (NOT camelCase)
   [ ] "Book Now" button is orange (#d45800)
   [ ] Price is orange
   [ ] Category badge is blue (#1d6fa4)
   [ ] Card hover effect works (desktop)
   [ ] Staggered card entrance animation plays on load
   [ ] FilterChip "All" selected by default in orange
```

---

## What NOT to touch

| Area | Reason |
|------|--------|
| Equipment data fetching / tRPC calls | Backend logic |
| Search handler / filter logic | Keep existing search working |
| Booking flow (click Book Now → booking form) | Keep all navigation |
| Auth session / middleware | Keep login protection |
| `/dashboard`, `/profile` page content | Separate tasks |
| `packages/api`, `packages/db` | Backend — not in scope |
| `apps/bookings/lib/auth.ts` | Auth — not in scope |

---

## Visual summary: before → after

| Element | Before | After |
|---------|--------|-------|
| Header background | Grey/silver | White with subtle shadow |
| Logo | Black box around it | Clean, no box (multiply blend) |
| Navigation (mobile) | Top right text links | Bottom tab bar, iOS style |
| Navigation (desktop) | Text links top right | Top bar + hamburger → side drawer |
| Page heading | Blue on black bg | Dark on white bg, orange eyebrow |
| Search bar | White on dark | Refined grey-bg input with focus glow |
| Category filters | None | Horizontal scrollable orange/blue chips |
| Equipment cards | Peach bg, camelCase specs | White cards, emoji placeholders, readable specs |
| Card animation | None | Staggered framer-motion entrance |
| Overall theme | Dark + peach clash | White + blue + orange — clean and branded |