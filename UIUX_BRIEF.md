# UI/UX Brief
## Cohort PCCOE — Design System & Interface Guidelines

**Version:** 1.0  
**Date:** 2026-08-17  

---

## 1. Design Philosophy

Cohort PCCOE embodies a **Premium Dark Social Platform** aesthetic — combining the depth of glassmorphism, the energy of a student community, and the professionalism of a modern SaaS product.

### Core Design Principles

| Principle | Description |
|---|---|
| **Depth** | Multi-layered UI using glassmorphism creates visual hierarchy and depth |
| **Energy** | Vibrant accent colors and micro-animations convey an active, living campus |
| **Clarity** | Despite visual richness, information remains scannable and accessible |
| **Delight** | Subtle animations reward interactions and create a premium feel |
| **Trust** | Professional typography and structured layouts build credibility |

---

## 2. Color System

### 2.1 Palette

```css
:root {
  /* === DARK BACKGROUNDS === */
  --bg-base: #0B0E1A;           /* Deepest background (body) */
  --bg-elevated: #111827;       /* Card backgrounds */
  --bg-surface: #1A2237;        /* Elevated surfaces / modals */
  --bg-muted: #1E2D45;          /* Subtle differentiators */

  /* === BRAND / ACCENT COLORS === */
  --brand-primary: #6366F1;     /* Indigo — primary CTA, links */
  --brand-secondary: #8B5CF6;   /* Purple — secondary accent */
  --brand-gradient: linear-gradient(135deg, #6366F1, #8B5CF6);
  
  /* === FUNCTIONAL COLORS === */
  --accent-blue: #3B82F6;       /* Info, active states */
  --accent-cyan: #06B6D4;       /* Connect/messaging module */
  --accent-emerald: #10B981;    /* Success, online indicators */
  --accent-amber: #F59E0B;      /* Warnings, calendar highlights */
  --accent-rose: #F43F5E;       /* Errors, XD board category */
  --accent-violet: #7C3AED;     /* Communities */

  /* === COMMUNITY CATEGORY COLORS === */
  --cat-technical: #3B82F6;
  --cat-cultural: #F59E0B;
  --cat-sports: #10B981;
  --cat-social: #EC4899;
  --cat-academic: #8B5CF6;

  /* === GLASS EFFECT === */
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.07);
  --glass-active: rgba(99, 102, 241, 0.12);

  /* === TEXT === */
  --text-primary: #F9FAFB;       /* Main content */
  --text-secondary: #9CA3AF;     /* Metadata, timestamps */
  --text-muted: #6B7280;         /* Placeholders, disabled */
  --text-inverse: #0B0E1A;       /* On light backgrounds */
  --text-accent: #6366F1;        /* Links, interactive text */

  /* === BORDERS === */
  --border-default: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-accent: rgba(99, 102, 241, 0.4);
}
```

### 2.2 Module Color Theming

| Module | Primary Color | Accent |
|---|---|---|
| Feed / Dashboard | `--brand-primary` | Indigo |
| Communities | `--accent-violet` | Purple |
| Connect (Messaging) | `--accent-cyan` | Cyan |
| XD Board | `--accent-rose` | Rose |
| Campus Map | `--accent-emerald` | Emerald |
| Calendar | `--accent-amber` | Amber |
| Profile | `--brand-secondary` | Violet |

---

## 3. Typography

### 3.1 Font Stack

```css
:root {
  --font-display: 'Urbanist', system-ui, sans-serif;   /* Headings, brand text */
  --font-body: 'Inter Tight', system-ui, sans-serif;   /* Body, UI text */
  --font-mono: 'JetBrains Mono', monospace;            /* Code snippets (if any) */
}
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700;800&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

```css
:root {
  /* Display (Urbanist) */
  --text-display-xl: 3rem;       /* 48px — Hero headings */
  --text-display-lg: 2.25rem;    /* 36px — Page titles */
  --text-display-md: 1.875rem;   /* 30px — Section headings */
  
  /* Headings (Urbanist) */
  --text-h1: 1.5rem;             /* 24px */
  --text-h2: 1.25rem;            /* 20px */
  --text-h3: 1.125rem;           /* 18px */
  
  /* Body (Inter Tight) */
  --text-lg: 1rem;               /* 16px — Primary body */
  --text-md: 0.9375rem;          /* 15px — Secondary body */
  --text-sm: 0.875rem;           /* 14px — UI labels, metadata */
  --text-xs: 0.75rem;            /* 12px — Timestamps, captions */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  /* Font Weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

---

## 4. Spacing & Layout

```css
:root {
  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */

  /* Layout */
  --sidebar-width: 240px;
  --sidebar-collapsed: 68px;
  --topnav-height: 60px;
  --content-max-width: 680px;
  --content-wide: 960px;
}
```

---

## 5. Visual Effects

### 5.1 Glassmorphism

```css
/* Standard glass card */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

/* Elevated glass (modals, dropdowns) */
.glass-elevated {
  background: rgba(26, 34, 55, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(99,102,241,0.15);
}

/* Sidebar glass */
.glass-sidebar {
  background: rgba(11, 14, 26, 0.9);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-default);
}
```

### 5.2 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-xl: 0 24px 64px rgba(0,0,0,0.6);
  
  /* Colored glow shadows */
  --shadow-brand: 0 0 24px rgba(99,102,241,0.3);
  --shadow-cyan: 0 0 24px rgba(6,182,212,0.3);
  --shadow-rose: 0 0 24px rgba(244,63,94,0.3);
}
```

### 5.3 Border Radius

```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;   /* Pills, avatars */
}
```

---

## 6. Animation System

### 6.1 Motion Tokens

```css
:root {
  /* Duration */
  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);       /* Snappy exits */
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);         /* Smooth entries */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful bounce */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);     /* Material-style */
}
```

### 6.2 Keyframe Animations

```css
/* Fade + slide up (card/modal entry) */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Pulse (loading skeleton) */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Scale in (notification, toast) */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

/* Slide in from right (chat panel) */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Bounce in (message send confirmation) */
@keyframes bounceIn {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
```

---

## 7. Component Library Specifications

### 7.1 Navigation Sidebar

```
┌─────────────────────┐
│  🔷 COHORT  PCCOE  │  ← Logo + brand name (Urbanist Bold)
├─────────────────────┤
│  [Avatar] You       │  ← User avatar + name chip
├─────────────────────┤
│  🏠 Home            │  ← Active = brand gradient left border
│  👥 Communities     │
│  💬 Connect    (3)  │  ← Unread badge
│  🎭 XD Board        │
│  🗺️ Campus Map      │
│  📅 Calendar        │
│  👤 Profile         │
├─────────────────────┤
│  ⚙️ Settings        │
│  🚪 Sign Out        │
└─────────────────────┘
```

**Specs:**
- Width: 240px (desktop) / slide-over on mobile
- Active item: gradient left border + glass-active background
- Hover: glass-hover background, 200ms ease
- Icons: Lucide React, 20px
- Font: Inter Tight Medium 14px
- Unread badges: circular, brand-primary, 18px diameter

---

### 7.2 Post Card

```
┌────────────────────────────────────────┐
│  [Avatar] Name · Branch, Year  14m ago │  ← Header
│  🔷 Community Tag (if community post)  │
├────────────────────────────────────────┤
│                                        │
│  Post content text here. Max 3 lines   │
│  before "Show more" expand...          │
│                                        │
│  [Image if attached]                   │
├────────────────────────────────────────┤
│  ❤️ 12    💬 5    ↗️ Share             │  ← Action row
└────────────────────────────────────────┘
```

**Specs:**
- Background: glass-card (glass-bg + blur)
- Border: 1px solid glass-border
- Radius: --radius-lg (16px)
- Padding: --space-5 (20px)
- Avatar: 40px circle
- Like animation: heart scale bounce on click
- Hover: subtle border brightens (glass-hover)

---

### 7.3 Community Card

```
┌───────────────────────────────┐
│  [Community Logo]  ≡ 847      │  ← Logo + member count
│  GDGC PCCOE                   │  ← Name (Urbanist SemiBold)
│  🔵 Technical                 │  ← Category badge
│  Security & web app testing   │  ← Description (2 lines max)
│                               │
│  [  Subscribe  ]              │  ← CTA button
└───────────────────────────────┘
```

**Specs:**
- Logo: 64px rounded square
- Category badge: colored pill matching --cat-* colors
- Subscribe button: gradient bg when not subscribed, outlined when subscribed

---

### 7.4 Button System

```css
/* Primary */
.btn-primary {
  background: var(--brand-gradient);
  color: white;
  border-radius: var(--radius-full);
  padding: 10px 24px;
  font: var(--font-semibold) var(--text-sm) var(--font-body);
  transition: transform 150ms, box-shadow 200ms;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-brand); }
.btn-primary:active { transform: translateY(0) scale(0.98); }

/* Ghost */
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  padding: 10px 24px;
}
.btn-ghost:hover { background: var(--glass-hover); border-color: var(--border-accent); }

/* Icon Button */
.btn-icon {
  width: 40px; height: 40px;
  border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}
.btn-icon:hover { background: var(--glass-hover); }
```

---

### 7.5 Avatar

```
Sizes: 
  xs = 24px (comment list)
  sm = 32px (sidebar user chip)
  md = 40px (post card)
  lg = 56px (profile header)
  xl = 96px (profile page hero)
  
  All: border-radius: 50%
  Online indicator: 10px dot, emerald, bottom-right
  Fallback: Initials on gradient background
```

---

### 7.6 Chat Bubble

```
Own messages (right-aligned):
┌─────────────────────────────┐
│ Hey are you coming to the   │
│ GDGC jam tomorrow?       👁 │  ← Read receipt
└───────────────────── 2:34pm ┘
Background: var(--brand-gradient)

Other messages (left-aligned):
  [Av] ┌──────────────────────┐
       │ Yeah! Looking forward │
       │ to it                 │
       └─────────────── 2:35pm ┘
  Background: var(--glass-bg)
  Border: 1px solid var(--glass-border)
```

---

### 7.7 Input Fields

```css
.input {
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--text-primary);
  font: var(--font-regular) var(--text-sm) var(--font-body);
  transition: border-color 150ms;
}
.input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}
.input::placeholder { color: var(--text-muted); }
```

---

### 7.8 Badge / Tag

```css
/* Category badge */
.badge { 
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font: var(--font-semibold) var(--text-xs) var(--font-body);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.badge-technical { background: rgba(59,130,246,0.15); color: #60A5FA; }
.badge-cultural   { background: rgba(245,158,11,0.15); color: #FCD34D; }
.badge-sports     { background: rgba(16,185,129,0.15); color: #34D399; }
```

---

### 7.9 Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-muted) 25%,
    rgba(255,255,255,0.05) 50%,
    var(--bg-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}
```

---

### 7.10 Toast Notification

```
┌───────────────────────────┐
│ ✅  Profile updated        │  ← Success
└───────────────────────────┘

┌───────────────────────────┐
│ ❌  Failed to send message │  ← Error
└───────────────────────────┘

Position: bottom-right, 16px margin
Animation: scaleIn → auto-dismiss 3s
Stack: max 3 toasts visible
```

---

## 8. Page-by-Page Design Specifications

### 8.1 Login Page

```
Background: Full-screen gradient mesh
  (indigo + purple + dark base)

Center card (glass-elevated):
  • Cohort logo (72px, animated subtle glow pulse)
  • "Welcome to Cohort" (Urbanist Bold 28px)
  • "The official PCCOE campus platform" (Inter Tight 14px, muted)
  • Google Sign In button (white bg, Google logo, Inter Medium 15px)
  • "For PCCOE students, faculty & alumni" (caption, 12px muted)
  
  Animated: floating particles/orbs in background
```

### 8.2 Dashboard / Feed Page

```
Layout: 3-column on desktop
  Left: Sidebar (240px)
  Center: Feed (max 680px content)
  Right: Sidebar widgets (280px)

Feed:
  - Pinned announcements card (brand-primary border)
  - Post cards (infinite scroll)
  - FAB (Floating Action Button) for new post

Right Sidebar Widgets:
  - "Upcoming Events" card (next 3 calendar events)
  - "Communities You May Like" (2-3 recommendations)
  - "Active Chats" mini preview
```

### 8.3 Communities Page

```
Top: Hero bar with search + filter pills
  [Technical] [Cultural] [Sports] [Social] [Academic]

Grid: 3 columns on desktop, 2 on tablet, 1 on mobile
  Community cards with subscribe action

Individual Community:
  • Cover banner (full width, 200px tall)
  • Logo (80px, -40px overlap from banner)
  • Name (Urbanist Bold 24px)
  • Stats row: X members · Y posts · Z events
  • Tabs: Posts | Events | Members | About
  • Subscribe/Subscribed toggle button (top right)
```

### 8.4 Connect (Messaging) Page

```
Layout: 2-pane (like WhatsApp Web)
  Left pane (320px): Conversation list
    • Search bar
    • Recent chats with avatar, name, last message, time, unread count
  Right pane: Active chat
    • Chat header (avatar, name, online status)
    • Message thread (reverse chronological scroll)
    • Message input bar with emoji picker + attach button
    
Responsive: Full-width chat on mobile (back button to list)
```

### 8.5 XD Board

```
Top: Compose area (collapsed → expands on click)
  "What's on your mind? Post anonymously →"

Sort tabs: [🔥 Hot] [🆕 New] [⬆️ Top]

Category filter pills: All | Tips | Ideas | Rants | Opportunities | Memes

Post cards:
  • "Anonymous" label (grey, generic avatar icon)
  • Category badge
  • Post content
  • ▲ Upvote count | 💬 Comment count | 🚩 Report
  • Timestamp
```

### 8.6 Profile Page

```
Hero section:
  • Background: gradient + optional cover photo
  • Avatar (96px, ring border with brand gradient)
  • Name (Urbanist Bold 24px)
  • Year, Branch, Division (Inter Tight 14px)
  • Bio (Inter Regular 15px, max 3 lines)
  • Stats: X Following | Y Followers | Z Communities
  • [Edit Profile] or [Message] + [Follow] buttons

Tabs: About | Achievements | Activity

Achievements:
  • Cards grid: Certification / Hackathon / Award
  • Each card: icon, title, issuer, date, link
```

---

## 9. Responsive Breakpoints

```css
:root {
  --bp-mobile: 640px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-wide: 1280px;
}

/* Mobile: sidebar collapses to bottom navigation bar */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .bottom-nav { display: flex; }
  .content-grid { grid-template-columns: 1fr; }
  .right-sidebar { display: none; }
}
```

### Mobile Bottom Navigation

```
Bottom nav bar (fixed, glass):
  🏠  👥  💬  🎭  👤
 Home Comm Chat  XD Profile
```

---

## 10. Iconography

- **Library**: Lucide React (consistent stroke-width 1.5px)
- **Size**: 18-20px in nav, 16px in text, 24px in feature highlights
- **Module icons**:
  - Home: `Home`
  - Communities: `Users`
  - Connect: `MessageCircle`
  - XD Board: `Shuffle` or `Zap`
  - Campus Map: `Map`
  - Calendar: `CalendarDays`
  - Profile: `User`
  - Notifications: `Bell`
  - Settings: `Settings`
  - Search: `Search`

---

## 11. Micro-interaction Patterns

| Interaction | Animation |
|---|---|
| Like button click | Heart scales to 1.4x → bounces back + red fill |
| Subscribe button | Morph from outlined → gradient filled + checkmark |
| Send message | Message bubble slides in from right |
| New notification | Bell wobbles, badge scales in |
| Page transition | Fade + 12px slide up (150ms) |
| Sidebar item hover | Left indicator bar slides in from left |
| Post card hover | Subtle y: -2px lift + border brightness increase |
| Avatar hover | Tooltip with name fades in (200ms) |
| Image upload | Progress ring around image preview |

---

## 12. Accessibility

- **Color contrast**: All text meets WCAG 2.1 AA (4.5:1 minimum)
- **Focus styles**: Visible outline on all interactive elements (`box-shadow: 0 0 0 3px rgba(99,102,241,0.5)`)
- **ARIA labels**: All icon-only buttons have `aria-label`
- **Keyboard navigation**: Full tab-order support, Escape closes modals
- **Screen readers**: Semantic HTML, landmark regions, live regions for notifications
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables animations

---

## 13. Design Token Summary Table

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0B0E1A` | Page background |
| `--brand-primary` | `#6366F1` | Primary buttons, active states |
| `--brand-gradient` | `indigo → purple` | CTAs, avatars, highlights |
| `--glass-bg` | `rgba(255,255,255,0.04)` | Card backgrounds |
| `--font-display` | `Urbanist` | All headings |
| `--font-body` | `Inter Tight` | All body text |
| `--radius-lg` | `16px` | Cards |
| `--radius-full` | `9999px` | Buttons, badges, avatars |
| `--duration-normal` | `200ms` | Standard transitions |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Exit animations |
