# Technical Requirements Document (TRD)
## Cohort PCCOE — Campus Social Platform Clone

**Version:** 1.0  
**Date:** 2026-08-17  
**Status:** Draft  

---

## 1. Technology Stack

### 1.1 Frontend

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Framework | **React** | 18.x | Component-based SPA, concurrent rendering |
| Build Tool | **Vite** | 5.x | Fast HMR, optimized production builds |
| Routing | **React Router DOM** | 6.x | Client-side SPA routing |
| State Management | **Zustand** | 4.x | Lightweight, hook-based global state |
| Server State | **TanStack Query** | 5.x | Data fetching, caching, real-time sync |
| Styling | **Vanilla CSS + CSS Modules** | — | Full control, no utility-class bloat |
| Icons | **Lucide React** | latest | Clean, consistent icon set |
| Maps | **TomTom Maps SDK** | 6.25.x | Interactive 3D campus map |
| Fonts | **Google Fonts** | — | Urbanist + Inter Tight |
| Encryption | **TweetNaCl.js** | latest | E2E encryption for messaging |

### 1.2 Backend (BaaS — Supabase)

| Layer | Technology | Justification |
|---|---|---|
| Database | **PostgreSQL 15** (via Supabase) | Relational, row-level security, JSON support |
| Authentication | **Supabase Auth** + Google OAuth | Managed auth with social login |
| Realtime | **Supabase Realtime** (WebSocket) | Live messaging, presence, feed updates |
| Storage | **Supabase Storage** | Profile photos, media uploads, club assets |
| Edge Functions | **Deno-based Edge Functions** | Server-side logic, webhooks, encryption |
| Row-Level Security | **Supabase RLS Policies** | Fine-grained data access control |

### 1.3 Infrastructure

| Service | Provider | Purpose |
|---|---|---|
| Frontend Hosting | **Vercel / Netlify** | CDN-based deployment, CI/CD |
| Database + Backend | **Supabase** | All backend services |
| Maps CDN | **TomTom CDN** | Maps SDK delivery |
| Domain | Custom domain | cohortpccoe.in (or clone equivalent) |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser)                    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  React   │  │  Zustand │  │  TanStack Query  │  │
│  │  Router  │  │  Store   │  │  (Server State)  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       └─────────────┴─────────────────┘             │
│                       │                             │
│              ┌────────▼────────┐                    │
│              │  Supabase Client│                    │
│              │  (supabase-js)  │                    │
│              └────────┬────────┘                    │
└───────────────────────┼─────────────────────────────┘
                        │ HTTPS / WebSocket
┌───────────────────────▼─────────────────────────────┐
│               SUPABASE BACKEND                       │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │   Auth   │  │ Realtime │  │  Edge Functions │   │
│  │(Google   │  │(Channels)│  │  (Deno runtime) │   │
│  │ OAuth)   │  └──────────┘  └─────────────────┘   │
│  └──────────┘                                       │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  PostgreSQL DB   │  │   Supabase Storage   │    │
│  │  (with RLS)      │  │   (files/images)     │    │
│  └──────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────┘
         │
┌────────▼────────┐
│  TomTom Maps    │
│  CDN / API      │
└─────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Folder Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── components/
│   ├── ui/              # Reusable primitive components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Avatar.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   └── Badge.jsx
│   ├── layout/          # Layout components
│   │   ├── Sidebar.jsx
│   │   ├── TopNav.jsx
│   │   └── AppShell.jsx
│   └── features/        # Feature-specific components
│       ├── feed/
│       ├── communities/
│       ├── connect/
│       ├── xd/
│       ├── map/
│       ├── calendar/
│       └── profile/
├── pages/               # Route-level page components
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── CommunitiesPage.jsx
│   ├── CommunityDetailPage.jsx
│   ├── ConnectPage.jsx
│   ├── XDPage.jsx
│   ├── MapPage.jsx
│   ├── CalendarPage.jsx
│   ├── ProfilePage.jsx
│   └── SettingsPage.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   ├── useRealtime.js
│   ├── useFeed.js
│   ├── useMessages.js
│   └── useProfile.js
├── stores/              # Zustand global stores
│   ├── authStore.js
│   ├── uiStore.js
│   └── notificationStore.js
├── lib/                 # Utilities and config
│   ├── supabase.js      # Supabase client init
│   ├── encryption.js    # NaCl E2E encryption utils
│   ├── tomtom.js        # TomTom map initialization
│   └── constants.js
├── styles/              # Global CSS
│   ├── index.css        # Design tokens & globals
│   ├── animations.css   # Keyframe animations
│   └── glass.css        # Glassmorphism utilities
├── App.jsx              # Root + Router
└── main.jsx             # Entry point
```

### 3.2 Routing Structure

```
/                        → Redirect to /login or /dashboard
/login                   → Login page (Google OAuth)
/dashboard               → Home Feed (Protected)
/communities             → Community browser (Protected)
/communities/:communityId → Community detail page (Protected)
/connect                 → Messaging hub (Protected)
/connect/:chatId         → Individual chat (Protected)
/xd                      → Exchange board (Protected)
/xd/:postId              → XD Post detail (Protected)
/map                     → Campus map (Protected)
/calendar                → Academic calendar (Protected)
/profile                 → Own profile (Protected)
/profile/:userId         → Other user's profile (Protected)
/settings                → User settings (Protected)
*                        → 404 Not Found
```

### 3.3 State Management Strategy

| State Type | Solution |
|---|---|
| Auth / User Session | Zustand `authStore` + Supabase session |
| Server Data (feed, messages) | TanStack Query with Supabase subscription |
| UI State (modals, sidebar open) | Zustand `uiStore` |
| Real-time data | Supabase Realtime Channels |
| Form State | React local state / React Hook Form |

---

## 4. Authentication Flow

```
User visits site
      │
      ▼
Is session valid?
  ├─ YES → Redirect to /dashboard
  └─ NO  → Show /login
             │
             ▼
        "Sign in with Google" button
             │
             ▼
        Supabase Auth → Google OAuth 2.0
             │
             ▼
        Is email @pccoe.org or @pccoepune.org?
          ├─ YES → Check if profile exists
          │         ├─ YES → /dashboard
          │         └─ NO  → /onboarding (setup wizard)
          └─ NO  → Reject + show error toast
```

---

## 5. Realtime Architecture

### 5.1 Supabase Channels Used

| Channel | Purpose | Event Type |
|---|---|---|
| `public:posts` | New feed posts | INSERT |
| `public:messages:{chatId}` | Chat messages | INSERT |
| `public:notifications:{userId}` | Personal notifications | INSERT |
| `public:community_posts:{communityId}` | Club announcements | INSERT |
| `presence:online` | Online user tracking | PRESENCE |

### 5.2 Message Delivery Flow

```
Sender types message
      │
      ▼
Encrypt with recipient's public key (NaCl)
      │
      ▼
INSERT to Supabase messages table
      │
      ▼
Supabase Realtime broadcasts to channel
      │
      ▼
Recipient's client receives WebSocket event
      │
      ▼
Decrypt with private key → render in UI
```

---

## 6. End-to-End Encryption (E2E)

### 6.1 Key Management
- Each user has an asymmetric keypair (Curve25519 via TweetNaCl)
- Public key stored in `users.public_key` column (Supabase)
- Private key stored only in browser localStorage (never sent to server)
- Key regeneration on new device login with warning

### 6.2 Encryption Algorithm
- **Algorithm**: X25519-XSalsa20-Poly1305 (NaCl `box`)
- **Key Exchange**: Diffie-Hellman via Curve25519
- **Message Encryption**: XSalsa20 stream cipher
- **Authentication**: Poly1305 MAC

---

## 7. Database Schema (High-Level)

> See `BACKEND_SCHEMA.md` for detailed schema with all columns and RLS policies.

### Core Tables

| Table | Description |
|---|---|
| `users` | User profiles and metadata |
| `communities` | Club/organization records |
| `community_members` | User ↔ Community subscriptions |
| `posts` | Feed posts (community or personal) |
| `post_reactions` | Likes and emoji reactions on posts |
| `comments` | Nested comments on posts |
| `messages` | Direct and group messages (encrypted) |
| `conversations` | Chat sessions (DM or group) |
| `conversation_members` | Users in a conversation |
| `xd_posts` | Anonymous exchange board posts |
| `xd_votes` | Upvotes on XD posts |
| `calendar_events` | Academic calendar events |
| `notifications` | In-app notification queue |

---

## 8. Security Requirements

### 8.1 Client-Side
```javascript
// Context menu disabled
document.addEventListener('contextmenu', e => e.preventDefault());

// DevTools blocked
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12') e.preventDefault();
  if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) e.preventDefault();
  if (e.ctrlKey && e.key === 'u') e.preventDefault();
});

// Text selection disabled on body
body { user-select: none; }
input, textarea, [contenteditable] { user-select: text; }
```

### 8.2 Server-Side (RLS Policies)

```sql
-- Users can only read their own private data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Messages only visible to conversation participants
CREATE POLICY "Messages visible to participants" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_members 
      WHERE conversation_id = messages.conversation_id
    )
  );
```

---

## 9. Performance Requirements

| Metric | Target | Strategy |
|---|---|---|
| First Contentful Paint | < 1.5s | Code splitting, lazy routes |
| Time to Interactive | < 3s | Preload auth, skeleton screens |
| Bundle Size | < 500KB gzipped | Tree-shaking, dynamic imports |
| API Response Time | < 200ms | Supabase indexes, query optimization |
| Message Latency | < 300ms | Supabase Realtime WebSocket |
| Image Load Time | < 1s | WebP format, Supabase Storage CDN |

### 9.1 Code Splitting Strategy
```javascript
// Lazy load all major pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ConnectPage = lazy(() => import('./pages/ConnectPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
// TomTom SDK loaded only when MapPage is mounted
```

---

## 10. API Endpoints (Supabase REST)

### Authentication
```
POST   /auth/v1/token?grant_type=oauth2   # Google OAuth
POST   /auth/v1/logout                    # Sign out
GET    /auth/v1/user                      # Get current user
```

### Users/Profiles
```
GET    /rest/v1/users?id=eq.{userId}      # Get user profile
PATCH  /rest/v1/users?id=eq.{userId}      # Update profile
```

### Feed
```
GET    /rest/v1/posts?order=created_at.desc&limit=20   # Paginated feed
POST   /rest/v1/posts                                  # Create post
DELETE /rest/v1/posts?id=eq.{postId}                   # Delete post
```

### Communities
```
GET    /rest/v1/communities               # List all communities
GET    /rest/v1/communities?id=eq.{id}    # Get community detail
POST   /rest/v1/community_members         # Subscribe to community
DELETE /rest/v1/community_members         # Unsubscribe
```

### Messaging
```
GET    /rest/v1/conversations             # Get user's conversations
POST   /rest/v1/messages                 # Send message (encrypted payload)
GET    /rest/v1/messages?conversation_id=eq.{id}  # Get messages
```

### XD Board
```
GET    /rest/v1/xd_posts?order=votes.desc  # Get XD posts by votes
POST   /rest/v1/xd_posts                   # Create anonymous post
POST   /rest/v1/xd_votes                   # Upvote XD post
```

### Calendar
```
GET    /rest/v1/calendar_events           # Get events
POST   /rest/v1/calendar_events           # Create event (admin only)
```

---

## 11. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# TomTom Maps
VITE_TOMTOM_API_KEY=your_tomtom_api_key

# App Config
VITE_ALLOWED_EMAIL_DOMAINS=pccoe.org,pccoepune.org
VITE_APP_URL=https://www.cohortpccoe.in
```

---

## 12. Testing Strategy

| Layer | Framework | Coverage Target |
|---|---|---|
| Unit Tests | Vitest | 70% |
| Component Tests | React Testing Library | 60% |
| E2E Tests | Playwright | Critical paths |
| API Tests | Supabase local dev | All endpoints |

### Critical E2E Paths
1. Login → Dashboard render
2. Join Community → See posts in feed
3. Send message → Recipient receives in real-time
4. Post on XD board → Anonymous attribution
5. View campus map → Location markers load

---

## 13. Development Tooling

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Code Quality
- **ESLint** + Airbnb config for code standards
- **Prettier** for formatting
- **Husky** pre-commit hooks for lint + format checks
- **GitHub Actions** for CI/CD pipeline
