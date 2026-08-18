# Cohort PCCOE

A React + Supabase campus social platform foundation for PCCOE. The app is built from the included PRD, TRD, app-flow, UI/UX, backend-schema, and implementation-plan documents.

## Features

- Protected React Router app shell with dashboard, communities, connect, XD board, map, calendar, profile, settings, and onboarding routes.
- Supabase-ready authentication flow with Google OAuth and PCCOE email-domain restriction.
- Demo mode fallback when Supabase environment variables are not configured.
- Reusable UI system with dark glass styling, responsive sidebar/top/mobile navigation, cards, buttons, badges, inputs, modals, tabs, skeletons, and toasts.
- Connected frontend foundations for feed posts, community subscription, XD posting/voting, chat draft flow, notifications, and realtime query invalidation.
- Supabase migrations for database tables, RLS policies, indexes, triggers, storage buckets, search RPCs, seed data, and realtime publication setup.
- NaCl encryption utilities prepared for end-to-end encrypted messaging.

## Tech Stack

- React 18
- Vite 5
- React Router DOM
- TanStack Query
- Zustand
- Supabase JS
- Lucide React
- TweetNaCl
- Vanilla CSS

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Supabase project for live backend mode
- TomTom API key for the future live map integration

### Install

```bash
pnpm install
```

If you prefer npm:

```bash
npm install
```

### Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill these values for live mode:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TOMTOM_API_KEY=your_tomtom_api_key
VITE_ALLOWED_EMAIL_DOMAINS=pccoe.org,pccoepune.org
VITE_APP_URL=http://localhost:5173
```

Without Supabase values, the app runs in demo mode using local seed data.

### Development

```bash
pnpm dev
```

Open:

```text
http://localhost:5173
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## Supabase Setup

Apply the SQL migrations in order:

1. `supabase/migrations/202608180001_initial_schema.sql`
2. `supabase/migrations/202608180002_storage_search_realtime.sql`

These migrations create:

- User/profile, community, feed, comments, messaging, XD, calendar, location, notification, and follow tables.
- Row-level security policies.
- Indexes and full-text-search helpers.
- Counter/update triggers.
- Storage buckets and storage policies.
- Realtime publication entries.

After applying migrations:

- Enable Google OAuth in Supabase Auth.
- Add `http://localhost:5173/auth/callback` to allowed redirect URLs.
- Add your production callback URL before deployment.
- Ensure the configured allowed domains match `VITE_ALLOWED_EMAIL_DOMAINS`.

## Project Structure

```text
src/
  components/
    features/        Feature components
    layout/          App shell, nav, search, notifications
    ui/              Reusable primitives
  hooks/             Auth, data, realtime helpers
  lib/               Supabase, auth, API, constants, encryption
  pages/             Route-level pages
  stores/            Zustand stores
  styles/            Global CSS and feature styles
supabase/
  migrations/        Database/storage/realtime SQL
```

## Current Status

See `REQUIREMENTS_AUDIT.md` for the current implementation status against the product and technical requirements.

Completed foundations include:

- App flow and routing
- Core UI shell
- Backend schema
- Demo data and live Supabase query fallbacks
- Key action wiring for posts, communities, XD, chat draft, and notifications
- Lint/build verification

Still left for full production readiness:

- Complete encrypted live message sending with recipient keys.
- Full onboarding persistence and avatar upload.
- Live TomTom map integration.
- Calendar month/week grid and admin event creation UI.
- Feed comments/reactions/share flows.
- Profile editing and achievements CRUD.
- Storage upload flows.
- Full Supabase integration QA with real credentials.

## Documentation

- `PRD.md`
- `TRD.md`
- `APP_FLOW.md`
- `UIUX_BRIEF.md`
- `BACKEND_SCHEMA.md`
- `IMPLEMENTATION_PLAN.md`
- `REQUIREMENTS_AUDIT.md`
