# Cohort PCCOE Requirements Audit

Last checked: 2026-08-18

## Connection And Function Check

| Area | Status | Notes |
|---|---|---|
| Vite/React app boot | Working | `src/main.jsx` mounts `App` with TanStack Query. |
| Routing | Working | All documented primary routes exist in `src/App.jsx`; `/connect/:chatId` now controls the active conversation. |
| Protected routes | Working foundation | Demo mode auto-authenticates; live mode uses Supabase session/profile. |
| Returning-user redirect | Working | `/login` redirects onboarded users to `/dashboard` and incomplete users to `/onboarding`. |
| Google OAuth | Wired, needs env/provider setup | `signInWithGoogle` calls Supabase OAuth; requires Supabase project and Google provider config. |
| PCCOE domain restriction | Wired | `isAllowedPccoeEmail` checks configured domains in auth callback. |
| Supabase client | Wired with fallback | `src/lib/supabase.js` uses real config when env vars exist, otherwise returns demo data. |
| Server state hooks | Wired | Feed, communities, conversations, messages, XD posts, calendar, locations query Supabase with demo fallbacks. |
| Live write helpers | Wired | Post, community subscription, XD post/vote, and calendar helpers use `auth.getUser()` for RLS-safe live writes. |
| UI action connections | Wired foundation | Feed composer, community subscribe toggle, XD create/vote/report, and chat draft send update cache/toasts. |
| Realtime helper | Partially wired | Feed, calendar, XD posts, active chat messages, and notifications invalidate/update through Supabase Realtime when configured. |
| E2E encryption utilities | Wired utility | NaCl key generation/encrypt/decrypt helpers exist; messaging page does not yet send live encrypted messages. |
| Backend schema | Implemented migration | Core tables, indexes, RLS, triggers, seed data, storage policies, search RPCs, and realtime publication setup are in `supabase/migrations`. |
| Build/lint | Passing | Production build and ESLint pass after latest changes. |

## PRD Requirement Coverage

| Module | Implemented | Partial | Left |
|---|---|---|---|
| Authentication & onboarding | Login page, auth callback, protected route, returning-user redirect, domain check, onboarding UI | Profile upsert and demo onboarding | Real profile form persistence, avatar upload, community subscribe during onboarding |
| Home feed | Feed route, post cards, composer UI, Supabase read hook, create-post action, realtime invalidation | Cache update is basic | Infinite scroll, optimistic reactions, comments, share, realtime new-post banner |
| Communities | Browser, search/filter UI, detail page, community cards, subscribe toggle action | Cache updates subscription state; live membership shape needs richer joined data | Members/events tabs, create request flow |
| Connect messaging | Two-pane UI, route-param active chat, conversations/messages hooks, local send cache update, encryption utilities, realtime invalidation | Live encrypted send needs recipient public-key/session-key flow | Live DM creation, group chat, typing, receipts, files |
| XD board | Anonymous feed UI, compose/category UI, sort controls, create/vote/report actions, realtime invalidation | Report is toast-only; vote cache is simple | Comments, moderation persistence, anonymous persona persistence |
| Campus map | Map page and location list/visual marker preview | Supabase location hook exists | Real TomTom SDK map initialization, pan/search, directions, event overlays |
| Academic calendar | Calendar/event list UI and event hook | Create-event helper exists | Month/week grid, event modal, admin creation UI, reminders, Google Calendar link |
| Student profiles | Profile page, profile summary, skills/communities display | Reads auth/demo user | Edit/save profile, achievements CRUD, other profile actions, follow/message |
| Search & discovery | Ctrl/Cmd+K modal searches demo communities/posts | Local-only search | Supabase RPC search across users/communities/posts and keyboard result navigation |
| Notifications | Notification panel/store/toasts, live insert subscription in app shell | Static fallback remains for demo mode | Entity navigation, mark-as-read persistence |
| Security | Context menu/devtools key blocking, RLS migration, auth domain check | Client hardening is basic | Input sanitization, storage policy testing, full RLS test suite |
| Accessibility/responsive | Semantic routes, buttons/labels, mobile nav, responsive CSS | Basic coverage | Formal axe audit and keyboard pass on every workflow |

## Current Scope Reality

This is a professional v1 foundation, not the full 14-16 week product described in the implementation plan. The backend model, route/component architecture, core action connections, and several realtime invalidation paths are in place; the remaining work is completing every advanced workflow, adding robust tests, and running full Supabase/TomTom integration QA with real credentials.
