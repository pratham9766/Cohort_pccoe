# Implementation Plan
## Cohort PCCOE — Clone Build Roadmap

**Version:** 1.0  
**Date:** 2026-08-17  
**Total Estimate:** 14–16 weeks (solo dev) / 6–8 weeks (team of 3)

---

## Overview

This document outlines the complete, phased implementation plan for building a full-featured clone of the Cohort PCCOE campus social platform.

> [!IMPORTANT]
> Complete phases in order. Each phase depends on the foundation laid by the previous one.
> Start with Phase 0 and 1 before writing any feature code.

---

## Phase 0: Project Setup & Infrastructure
**Estimated Time:** 3–4 days

### 0.1 Vite + React Project Initialization
```bash
# Create project
npm create vite@latest cohort-pccoe -- --template react
cd cohort-pccoe
npm install

# Core dependencies
npm install react-router-dom@6 zustand @tanstack/react-query
npm install @supabase/supabase-js
npm install lucide-react tweetnacl tweetnacl-util

# Dev dependencies
npm install -D @types/react @types/react-dom
npm install -D eslint prettier eslint-plugin-react
```

### 0.2 Supabase Project Setup
- [ ] Create new Supabase project at supabase.com
- [ ] Note: Project URL + anon key
- [ ] Enable Google OAuth provider in Auth settings
- [ ] Set redirect URL to `http://localhost:5173/auth/callback`
- [ ] Enable Realtime for: `messages`, `notifications`, `xd_posts`, `posts`

### 0.3 Environment Configuration
```env
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_TOMTOM_API_KEY=your_key
VITE_ALLOWED_EMAIL_DOMAINS=pccoe.org,pccoepune.org
```

### 0.4 Folder Structure Setup
- [ ] Create all directories as specified in TRD Section 3.1
- [ ] Set up path aliases in `vite.config.js`
  ```js
  resolve: { alias: { '@': '/src' } }
  ```

### 0.5 ESLint + Prettier
```json
// .prettierrc
{ "semi": true, "singleQuote": true, "tabWidth": 2 }
```

### 0.6 Database Schema Deployment
- [ ] Run all CREATE TABLE statements from `BACKEND_SCHEMA.md`
- [ ] Apply all RLS policies
- [ ] Set up storage buckets (avatars, community-assets, post-media, message-files)
- [ ] Run seed data (initial communities)
- [ ] Set up database triggers and functions

**✅ Phase 0 Complete When:**
- `npm run dev` starts without errors
- Supabase connection test passes
- All tables visible in Supabase dashboard

---

## Phase 1: Design System & App Shell
**Estimated Time:** 5–7 days

### 1.1 Global CSS Design System
- [ ] Create `src/styles/index.css` with all CSS custom properties from UI/UX Brief
  - Color tokens
  - Typography scale
  - Spacing scale
  - Border radius tokens
  - Animation durations and easings
- [ ] Create `src/styles/animations.css` with all keyframes
- [ ] Create `src/styles/glass.css` with glassmorphism utility classes

### 1.2 Google Fonts Integration
```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700;800&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
```

### 1.3 TomTom Maps SDK Integration
```html
<!-- index.html -->
<link rel='stylesheet' href='https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css'>
<script src='https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js'></script>
```

### 1.4 Security Hardening (client-side)
```html
<!-- index.html body -->
<body oncontextmenu="return false">
  <style>
    body { user-select: none; -webkit-user-select: none; }
    input, textarea, [contenteditable] { user-select: text; }
  </style>
  <script>
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) e.preventDefault();
      if (e.ctrlKey && e.key === 'u') e.preventDefault();
    });
  </script>
</body>
```

### 1.5 UI Component Library (Primitives)

Build these reusable components:

| Component | File | Key Props |
|---|---|---|
| Button | `ui/Button.jsx` | `variant, size, loading, disabled` |
| Avatar | `ui/Avatar.jsx` | `size, src, fallback, online` |
| Badge | `ui/Badge.jsx` | `variant, size` |
| Card | `ui/Card.jsx` | `glass, hover, padding` |
| Input | `ui/Input.jsx` | `label, error, icon` |
| Modal | `ui/Modal.jsx` | `open, onClose, title` |
| Toast | `ui/Toast.jsx` | `type, message, duration` |
| Skeleton | `ui/Skeleton.jsx` | `width, height, circle` |
| Tabs | `ui/Tabs.jsx` | `tabs, activeTab` |
| Dropdown | `ui/Dropdown.jsx` | `trigger, items` |

### 1.6 App Shell / Layout

- [ ] `AppShell.jsx` — Sidebar + main content wrapper
- [ ] `Sidebar.jsx` — Navigation with all module links
- [ ] `TopNav.jsx` — Mobile top bar with hamburger menu
- [ ] `BottomNav.jsx` — Mobile bottom navigation bar
- [ ] `NotificationPanel.jsx` — Sliding notification drawer

### 1.7 Router Setup

```jsx
// App.jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
    <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="communities" element={<CommunitiesPage />} />
      <Route path="communities/:communityId" element={<CommunityDetailPage />} />
      <Route path="connect" element={<ConnectPage />} />
      <Route path="connect/:chatId" element={<ChatPage />} />
      <Route path="xd" element={<XDPage />} />
      <Route path="xd/:postId" element={<XDPostPage />} />
      <Route path="map" element={<MapPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="profile/:userId" element={<UserProfilePage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

### 1.8 Supabase Client Initialization

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**✅ Phase 1 Complete When:**
- App shell renders correctly (sidebar + content area)
- All navigation links are clickable with correct routes
- Design tokens applied globally
- All primitive UI components render correctly with correct styling

---

## Phase 2: Authentication
**Estimated Time:** 3–4 days

### 2.1 Zustand Auth Store
```js
// src/stores/authStore.js
const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  }
}));
```

### 2.2 Login Page
- [ ] Full-screen animated gradient background (CSS mesh gradient)
- [ ] Centered glass card
- [ ] Cohort logo with subtle glow animation
- [ ] "Sign in with Google" button with hover effects
- [ ] Google OAuth trigger via Supabase:
  ```js
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  });
  ```

### 2.3 Auth Callback Handler
```jsx
// pages/AuthCallback.jsx
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      const email = session.user.email;
      const allowedDomains = import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS.split(',');
      const isAllowed = allowedDomains.some(d => email.endsWith('@' + d));
      
      if (!isAllowed) {
        supabase.auth.signOut();
        navigate('/login?error=unauthorized_domain');
        return;
      }
      
      checkAndCreateProfile(session.user);
    }
  });
}, []);
```

### 2.4 Session Persistence & Protected Routes
```jsx
// components/ProtectedRoute.jsx
const { user, loading } = useAuthStore();
if (loading) return <SplashScreen />;
if (!user) return <Navigate to="/login" replace />;
if (!user.is_onboarded) return <Navigate to="/onboarding" replace />;
return children;
```

### 2.5 Auth State Listener
```js
// In App.jsx useEffect
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  if (session) {
    fetchUserProfile(session.user.id).then(setUser);
  } else {
    setUser(null);
  }
  setLoading(false);
});
```

### 2.6 Onboarding Wizard
- [ ] Multi-step form (4 steps)
- [ ] Step 1: Name, Year, Branch, Division, PRN
- [ ] Step 2: Avatar upload (Supabase Storage) or use Google photo
- [ ] Step 3: Bio, Skills (tag input), Interests (checkboxes)
- [ ] Step 4: Subscribe to communities (grid picker, select ≥1)
- [ ] On completion: `PATCH users SET is_onboarded = true`
- [ ] Progress indicator (step dots)

### 2.7 E2E Encryption Key Generation
```js
// On first login, generate keypair
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

const keyPair = nacl.box.keyPair();
localStorage.setItem('privateKey', encodeBase64(keyPair.secretKey));

// Store public key in database
await supabase.from('users').update({
  public_key: encodeBase64(keyPair.publicKey)
}).eq('id', userId);
```

**✅ Phase 2 Complete When:**
- Users can sign in with Google
- Domain restriction blocks non-PCCOE emails
- New users are routed to onboarding
- Onboarding completes and saves profile
- Session persists on page refresh

---

## Phase 3: Home Feed
**Estimated Time:** 4–5 days

### 3.1 Feed Data Hook
```js
// hooks/useFeed.js
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['feed', userId],
  queryFn: ({ pageParam = 0 }) =>
    supabase
      .from('posts')
      .select('*, author:users(*), community:communities(*), reactions:post_reactions(*)')
      .in('community_id', subscribedCommunityIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(pageParam, pageParam + 19),
  getNextPageParam: (last, all) => all.flat().length
});
```

### 3.2 Post Card Component
- [ ] Author avatar, name, community tag
- [ ] Content with "Show more" expand for long posts
- [ ] Media display (single image / grid)
- [ ] Reaction row: Like (optimistic), Comment, Share

### 3.3 Post Composer
- [ ] FAB (Floating Action Button) opens modal
- [ ] Rich text input
- [ ] Community selector (post to which community)
- [ ] Image upload to Supabase Storage
- [ ] Submit → INSERT to `posts` table

### 3.4 Realtime Feed Updates
```js
// Subscribe to new posts
supabase.channel('feed_updates')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, 
    (payload) => { showNewPostsBanner(payload.new); })
  .subscribe();
```

### 3.5 Infinite Scroll
- [ ] Intersection Observer on sentinel div at bottom
- [ ] Fetch next page on visibility
- [ ] "Load more" fallback button

**✅ Phase 3 Complete When:**
- Feed shows posts from subscribed communities
- Likes update optimistically
- New posts appear with "X new posts" banner
- Infinite scroll works

---

## Phase 4: Communities Module
**Estimated Time:** 4–5 days

### 4.1 Communities Browser Page
- [ ] Fetch all communities with `member_count`
- [ ] Grid layout (3 cols desktop / 2 tablet / 1 mobile)
- [ ] Search (debounced, FTS via `ilike` or `textSearch`)
- [ ] Category filter pills
- [ ] Community cards with subscribe toggle

### 4.2 Community Detail Page
- [ ] Cover banner + logo
- [ ] Stats (members, posts)
- [ ] Tabs: Posts | Events | Members | About
- [ ] Subscribe/Unsubscribe button
- [ ] Community-specific post feed

### 4.3 Community Subscribe Logic
```js
const subscribe = async (communityId) => {
  await supabase.from('community_members').insert({
    community_id: communityId,
    user_id: currentUser.id
  });
  queryClient.invalidateQueries(['communities']);
};
```

**✅ Phase 4 Complete When:**
- Can browse, search, filter communities
- Can subscribe/unsubscribe
- Community detail page shows posts and members
- Subscribed communities appear in sidebar

---

## Phase 5: Connect (Messaging)
**Estimated Time:** 6–7 days

### 5.1 Conversations List
- [ ] Fetch conversations ordered by `last_message_at`
- [ ] Show avatar, name, preview, unread count
- [ ] Search for existing conversations

### 5.2 New Chat Flow
- [ ] User search modal
- [ ] Create conversation if none exists
- [ ] Navigate to chat

### 5.3 Chat Interface
- [ ] Two-pane layout (list + active chat)
- [ ] Message bubbles (own right / theirs left)
- [ ] Timestamps, read receipts
- [ ] Auto-scroll to bottom on new messages

### 5.4 Message Send + E2E Encryption
```js
const sendMessage = async (content, conversationId, recipientPublicKey) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box(
    decodeUTF8(content),
    nonce,
    decodeBase64(recipientPublicKey),
    decodeBase64(privateKey)
  );
  
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: currentUser.id,
    encrypted_content: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
    message_type: 'text'
  });
};
```

### 5.5 Realtime Message Delivery
```js
supabase.channel(`messages:${conversationId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'messages',
    filter: `conversation_id=eq.${conversationId}` },
    (payload) => {
      const decrypted = decryptMessage(payload.new);
      appendMessage(decrypted);
    })
  .subscribe();
```

### 5.6 Typing Indicator (Supabase Presence)
```js
const channel = supabase.channel(`typing:${conversationId}`);
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({ typing: true, user_id: currentUser.id });
  }
});
```

### 5.7 Group Chat
- [ ] Create group with name + avatar
- [ ] Add/remove members
- [ ] Group-key encryption strategy (per-member encrypted session key)

**✅ Phase 5 Complete When:**
- Can start new DM conversations
- Messages send and receive in real-time
- E2E encryption verified (messages stored as ciphertext in DB)
- Typing indicator works
- Group chats functional

---

## Phase 6: XD (Exchange) Board
**Estimated Time:** 3–4 days

### 6.1 XD Feed
- [ ] Fetch xd_posts sorted by votes DESC or created_at DESC
- [ ] Anonymous post cards (no author info)
- [ ] Sort tabs: Hot / New / Top
- [ ] Category filter pills

### 6.2 Post Creation
- [ ] Compose area (expands on click)
- [ ] Category selector
- [ ] Media upload (optional)
- [ ] INSERT to xd_posts (author_id stored, NOT returned to client via RLS)

### 6.3 Voting System
```js
const vote = async (postId) => {
  const { error } = await supabase.from('xd_votes').insert({
    xd_post_id: postId, user_id: currentUser.id
  });
  if (error?.code === '23505') { // Unique violation = already voted
    await supabase.from('xd_votes').delete()
      .match({ xd_post_id: postId, user_id: currentUser.id });
  }
};
```

### 6.4 XD Comments
- [ ] Threaded comments (anonymous)
- [ ] 2-level nesting max

### 6.5 Report/Moderation
- [ ] Flag button on post
- [ ] Report reason modal
- [ ] SET is_flagged = true, trigger admin notification

**✅ Phase 6 Complete When:**
- Posts appear without author attribution
- Voting toggles correctly
- New posts appear in realtime
- Report flow works

---

## Phase 7: Campus Map
**Estimated Time:** 3–4 days

### 7.1 TomTom Map Initialization
```js
// Lazy loaded only on MapPage mount
const map = tt.map({
  key: import.meta.env.VITE_TOMTOM_API_KEY,
  container: 'map-container',
  center: [73.8394, 18.6286], // PCCOE coordinates
  zoom: 17,
  style: 'tomtom://vector/1/basic-night' // Dark mode style
});
```

### 7.2 Location Markers
- [ ] Fetch all campus_locations from Supabase
- [ ] Create custom styled markers per category
- [ ] Popup on marker click (name, category, floor info)
- [ ] Color-code by category

### 7.3 Search
- [ ] Search input filters campus_locations
- [ ] Pan map to matching location on selection

### 7.4 Event Pins
- [ ] Fetch upcoming calendar events with map_coordinates
- [ ] Overlay event pins on top of location markers
- [ ] Event popup with name, date, "View Details" link

**✅ Phase 7 Complete When:**
- Map renders centered on PCCOE campus
- All campus locations marked
- Search filters and pans correctly
- Event overlays working

---

## Phase 8: Academic Calendar
**Estimated Time:** 3–4 days

### 8.1 Calendar View
- [ ] Monthly grid calendar
- [ ] Event dots on dates
- [ ] Day click → show events in side panel
- [ ] Week view toggle

### 8.2 Event Detail
- [ ] Modal with full event info
- [ ] "View on Map" link (if location set)
- [ ] "Add to Google Calendar" (Google Calendar URL scheme)

### 8.3 Event Creation (Admin)
- [ ] Check if user role = 'admin' or 'faculty'
- [ ] Form with date picker, type selector, location picker
- [ ] INSERT to calendar_events

### 8.4 Reminders
- [ ] Browser notifications via Notification API
- [ ] "Remind me" button on event card

**✅ Phase 8 Complete When:**
- Calendar renders current month events
- Events show correct colors by type
- "Add to Google Calendar" works
- Admin can create events

---

## Phase 9: Student Profiles
**Estimated Time:** 3–4 days

### 9.1 Own Profile Page
- [ ] Fetch own user data + achievements + community memberships
- [ ] Render all profile sections
- [ ] Edit profile modal (avatar, bio, skills, links)
- [ ] Avatar upload to Supabase Storage

### 9.2 Achievement Manager
- [ ] Add certification / hackathon win / award
- [ ] Achievement cards grid
- [ ] Delete achievement
- [ ] PATCH users.achievements (JSONB array)

### 9.3 Other User Profile
- [ ] View-only mode (hide edit buttons)
- [ ] "Message" button → navigate to /connect with DM
- [ ] "Follow" button → INSERT user_follows

**✅ Phase 9 Complete When:**
- Profile fully renders with all sections
- Edit profile saves correctly
- Achievements add/delete correctly
- Other user profiles viewable

---

## Phase 10: Notifications & Real-time
**Estimated Time:** 2–3 days

### 10.1 Notification Store
```js
const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  markAsRead: async (id) => { /* ... */ },
  markAllRead: async () => { /* ... */ }
}));
```

### 10.2 Real-time Notification Listener
```js
supabase.channel(`notifications:${userId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'notifications',
    filter: `recipient_id=eq.${userId}` },
    (payload) => {
      addNotification(payload.new);
      showToast(payload.new.message);
    })
  .subscribe();
```

### 10.3 Notification Panel UI
- [ ] Sliding drawer from right
- [ ] Group by date (Today, Yesterday, Earlier)
- [ ] Mark as read on click
- [ ] "Mark all as read" button
- [ ] Navigate to entity on click

### 10.4 Bell Badge
- [ ] Animated badge with unread count
- [ ] Scales in when new notification arrives
- [ ] Clears on open

---

## Phase 11: Search
**Estimated Time:** 2–3 days

### 11.1 Global Search Modal
- [ ] Triggered by Search button or Ctrl+K
- [ ] Debounced input (300ms)
- [ ] Parallel queries to users, communities, posts (FTS)
- [ ] Grouped results display
- [ ] Keyboard navigation (arrow keys, enter)

### 11.2 Full-Text Search Queries
```js
const searchUsers = (q) =>
  supabase.rpc('search_users', { query: q });

// PostgreSQL function
CREATE FUNCTION search_users(query TEXT)
RETURNS SETOF users AS $$
  SELECT * FROM users
  WHERE to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(username,''))
    @@ plainto_tsquery('english', query)
  LIMIT 5;
$$ LANGUAGE sql;
```

---

## Phase 12: Polish, Performance & QA
**Estimated Time:** 5–7 days

### 12.1 Performance Optimization
- [ ] Lazy load all page components
- [ ] Skeleton loading states on all data-fetching components
- [ ] Image optimization (WebP, lazy loading via `loading="lazy"`)
- [ ] Virtual list for long message threads (react-virtual)
- [ ] Bundle analysis: `npm run build -- --analyze`

### 12.2 Error Boundaries
- [ ] Wrap each major page in `<ErrorBoundary>`
- [ ] Graceful fallback UI for failed components

### 12.3 Empty States
- [ ] Feed empty state (no communities subscribed)
- [ ] Empty chat list state
- [ ] Empty XD board state
- [ ] Empty profile achievements state

### 12.4 404 & Error Pages
- [ ] Branded 404 page with back-home button
- [ ] Network error state with retry button

### 12.5 Responsive Testing
- [ ] Test all pages on 320px, 768px, 1024px, 1440px
- [ ] Fix any overflow/layout issues
- [ ] Verify bottom nav works on mobile

### 12.6 Cross-Browser Testing
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Fix any webkit-specific CSS issues

### 12.7 Accessibility Audit
- [ ] Run axe-core on all pages
- [ ] Fix any AA compliance failures
- [ ] Verify keyboard navigation on all interactive elements

### 12.8 Security Checklist
- [ ] Context menu disabled on body
- [ ] DevTools keys blocked
- [ ] All Supabase RLS policies tested
- [ ] XSS prevention on all user content rendering
- [ ] No private keys ever stored in Supabase or transmitted

---

## Phase 13: Deployment
**Estimated Time:** 1–2 days

### 13.1 Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

### 13.2 Environment Variables on Vercel
- [ ] Set all VITE_* vars in Vercel project settings

### 13.3 Supabase Production Config
- [ ] Update OAuth redirect URL to production domain
- [ ] Enable email confirmation (optional)
- [ ] Set up database backups

### 13.4 Custom Domain
- [ ] Point domain to Vercel
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Update `VITE_APP_URL` to production URL

---

## Timeline Summary

| Phase | Feature | Duration |
|---|---|---|
| 0 | Project Setup | 3–4 days |
| 1 | Design System + App Shell | 5–7 days |
| 2 | Authentication | 3–4 days |
| 3 | Home Feed | 4–5 days |
| 4 | Communities | 4–5 days |
| 5 | Connect (Messaging) | 6–7 days |
| 6 | XD Board | 3–4 days |
| 7 | Campus Map | 3–4 days |
| 8 | Academic Calendar | 3–4 days |
| 9 | Student Profiles | 3–4 days |
| 10 | Notifications & Real-time | 2–3 days |
| 11 | Search | 2–3 days |
| 12 | Polish + QA | 5–7 days |
| 13 | Deployment | 1–2 days |
| **Total** | | **47–63 days** |

> [!TIP]
> With a **team of 3**, parallel phases (4+5+6 concurrently) reduce total time to **6–8 weeks**.

---

## Tech Stack Summary

```json
{
  "frontend": {
    "framework": "React 18",
    "build": "Vite 5",
    "routing": "React Router 6",
    "state": "Zustand 4",
    "serverState": "TanStack Query 5",
    "styling": "Vanilla CSS (CSS Custom Properties)",
    "icons": "Lucide React",
    "maps": "TomTom Maps SDK 6.25",
    "fonts": "Google Fonts (Urbanist + Inter Tight)",
    "encryption": "TweetNaCl.js"
  },
  "backend": {
    "database": "PostgreSQL 15 (Supabase)",
    "auth": "Supabase Auth + Google OAuth",
    "realtime": "Supabase Realtime (WebSocket)",
    "storage": "Supabase Storage",
    "edgeFunctions": "Deno (Supabase Edge Functions)"
  },
  "deployment": {
    "frontend": "Vercel",
    "backend": "Supabase (managed)"
  }
}
```

---

## Definition of Done

> [!IMPORTANT]
> A feature is considered "done" only when all of the following are true:

- [ ] Feature works correctly on desktop (1024px+)
- [ ] Feature works correctly on mobile (375px)
- [ ] Loading states (skeleton/spinner) implemented
- [ ] Error states handled with user-friendly messages
- [ ] Empty states implemented
- [ ] Supabase RLS policies tested and verified
- [ ] Realtime updates work (where applicable)
- [ ] No console errors
- [ ] Passes basic accessibility check (keyboard navigable, ARIA labels)
