# Cohort PCCOE

A React + Supabase campus social platform foundation for PCCOE. The app is built from the included PRD, TRD, app-flow, UI/UX, backend-schema, and implementation-plan documents.

## Features

- Public landing page matching the Cohort PCCOE product direction.
- Explicit demo login at `/demo` and `/demo-login` with local fixture data.
- Protected React Router app shell with dashboard, communities, connect, XD board, map, calendar, profile, settings, and onboarding routes.
- Supabase-ready authentication flow with Google OAuth and PCCOE email-domain restriction.
- Supabase-backed authentication and data paths with clear configuration errors when required environment variables are missing.
- Reusable UI system with dark glass styling, responsive sidebar/top/mobile navigation, cards, buttons, badges, inputs, modals, tabs, skeletons, and toasts.
- Connected frontend foundations for feed posts, community subscription, XD posting/voting, realtime message sending, notifications, and realtime query invalidation.
- Supabase migrations for database tables, RLS policies, indexes, triggers, storage buckets, search RPCs, seed data, and realtime publication setup.
- NaCl encryption utilities are present, but messaging should not be described as fully end-to-end encrypted until ciphertext-only delivery and protected key exchange are enabled.

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

# Server-only values for migrations/admin tooling. Never expose these with VITE_.
POSTGRES_HOST=db.xxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_DATABASE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://postgres:your_postgres_password@db.xxxxx.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Without Supabase values, the app fails clearly at auth/data boundaries instead of using production demo fallbacks.

### Demo Mode

Demo mode is explicit and local-only:

```text
http://localhost:5173/demo
```

It signs in as a fixture user and unlocks local fixture data. Normal production routes do not silently fall back to demo data.

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
3. `supabase/migrations/202608180003_security_foundations.sql`
4. `supabase/migrations/202608180004_permissions_security_hardening.sql`
5. `supabase/migrations/202608180005_conversation_rls_recursion_fix.sql`

These migrations create:

- User/profile, community, feed, comments, messaging, XD, calendar, location, notification, and follow tables.
- Row-level security policies.
- Indexes and full-text-search helpers.
- Counter/update triggers.
- Storage buckets and storage policies.
- Realtime publication entries.
- Institutional email enforcement, safer role handling, report/audit/achievement tables, stricter XD privacy, and safer conversation membership policies.
- Explicit authenticated grants, community/admin management policies, moderation policies, storage update/delete policies, and recursion-safe conversation RLS helper functions.

After applying migrations:

- Enable Google OAuth in Supabase Auth.
- Add `http://localhost:5173/auth/callback` to allowed redirect URLs.
- Add your production callback URL before deployment.
- Ensure the configured allowed domains match `VITE_ALLOWED_EMAIL_DOMAINS`.

### Production Supabase Checklist

1. Create a Supabase project and copy the project URL plus anon key into `.env`.
2. In Supabase Auth, enable Google OAuth and configure Google Cloud OAuth credentials.
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `https://your-production-domain/auth/callback`
4. Apply migrations in filename order through the Supabase SQL editor or CLI.
5. Confirm Realtime publication includes `posts`, `messages`, `notifications`, and `xd_posts`.
6. Confirm storage buckets exist: `avatars`, `community-assets`, `post-media`, `message-files`, `xd-media`.
7. Run the RLS/security regression suite against a non-production database before launch.

### Local PostgreSQL

For local PostgreSQL compatibility, the project includes a migration runner that creates lightweight `auth` and `storage` schema shims before applying Supabase migrations:

```bash
pnpm db:migrate:local
```

The runner reads `DATABASE_URL` from `.env`. Example:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cohort
```

### Security Tests

Run database authorization tests:

```bash
pnpm test:security
```

These tests attempt malicious operations such as editing another profile, deleting another post, reading private messages, role escalation, XD author leakage, unauthorized uploads, unauthorized audit writes, and unauthorized official event creation.

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
- Live Supabase query boundaries without silent demo fallbacks
- Key action wiring for posts, communities, XD, realtime message sending, and notifications
- Lint/build verification

Still left for full production readiness:

- Complete encrypted live message sending with recipient keys.
- Avatar upload and broader storage UX.
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
