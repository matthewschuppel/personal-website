# Matthew Schuppel Website

A polished public personal website plus a private-ready personal operating system called MatthewOS.

## Structure

Public routes:

- `/`
- `/about`
- `/resume`
- `/gallery`
- `/contact`

Private route:

- `/dashboard`
- `/dashboard/health`
- `/dashboard/westwall`

The public pages stay minimal and professional. MatthewOS is intentionally separated under
`/dashboard` so dashboard data is not exposed in public navigation or public page code.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Cloudflare Pages / Cloudflare runtime
- Cloudflare D1 for future structured dashboard data
- Cloudflare R2 for future files and media

This project is not configured as static export-only. Do not add `output: "export"` to
`next.config.mjs`; MatthewOS is prepared for long-term dynamic functionality.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Customize

- Site identity and resume data: `data/site.ts`
- MatthewOS mock data: `data/matthewos.ts`
- MatthewOS Health seed data: `data/health.ts`
- Public pages: `app/page.tsx`, `app/about/page.tsx`, `app/resume/page.tsx`, `app/gallery/page.tsx`, `app/contact/page.tsx`
- Dashboard shell: `components/MatthewOSDashboard.tsx`
- Health dashboard: `components/HealthDashboard.tsx`
- D1 schema: `schema.sql`
- Cloudflare bindings: `wrangler.jsonc`
- Previous structure snapshot: `docs/previous-website-structure.md`

## Cloudflare Pages Deployment

Use the GitHub repository as the Cloudflare Pages source.

Recommended settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: leave as the framework default for Next.js runtime builds
- Node version: current LTS

Because this app uses route handlers and Cloudflare bindings, keep it dynamic. The dashboard API
routes are scaffolded for Cloudflare runtime access to D1 and R2.

## Cloudflare D1

Create the database:

```bash
npx wrangler d1 create matthewos
```

Copy the returned database id into `wrangler.jsonc` under the `DB` binding.

Apply the schema:

```bash
npx wrangler d1 execute matthewos --file=./schema.sql
```

In Cloudflare Pages, add a D1 binding:

- Binding name: `DB`
- Database: `matthewos`

Tables included in `schema.sql`:

- `notes`
- `tasks`
- `documents`
- `trips`
- `home_projects`
- `work_projects`
- `bookmarks`
- `gallery_items`
- `health_profiles`
- `health_exercises`
- `health_workout_plans`
- `health_workout_sessions`
- `health_recipes`
- `health_meal_plan_entries`
- `health_daily_logs`
- `health_grocery_lists`
- `health_grocery_items`
- `health_pantry_items`
- `health_progress_entries`
- `health_progress_photos`
- `health_reminders`

## Cloudflare R2

Create buckets:

```bash
npx wrangler r2 bucket create matthewos-documents
npx wrangler r2 bucket create mws-gallery
```

In Cloudflare Pages, add R2 bindings:

- Binding name: `DOCUMENTS_BUCKET`, bucket: `matthewos-documents`
- Binding name: `GALLERY_BUCKET`, bucket: `mws-gallery`
- Binding name: `DASHBOARD_BUCKET`, bucket: `mws-gallery` or a separate private dashboard bucket

The current document and gallery endpoints are placeholders. They show where upload, list, download,
and delete logic should connect to R2 and where metadata should connect to D1.

Health progress photos use private R2 object storage through the dashboard bucket binding. The API
stores photo metadata in D1 and serves photos from `/api/health/photos/:id`, which should remain
behind Cloudflare Access with the rest of `/dashboard`.

## MatthewOS Health

The private Health module lives at `/dashboard/health`.

Current functionality:

- Health overview with calories, protein, water, workouts, groceries, weight, and wedding goal cards
- Today view for workout status, nutrition logging, meals, and reminders
- Workout plan builder, exercise library, session history, start/complete/skip actions
- Meal planner, recipe library, and rule-based healthy meal suggestions
- Grocery list generation from meal plans and shopping-mode checkoffs
- Pantry tracking with staple and expiration metadata
- Progress logging with trend averages and private progress photo upload scaffolding
- Reminder preference storage for future scheduled notifications

Health data is seeded from `data/health.ts` and persisted through `/api/health/*` route handlers
when the D1 binding is available. The meal suggestion endpoint is intentionally local and rule-based
for now; an AI provider can be added later without changing the dashboard surface.

Health API routes include:

- `GET /api/health`
- `POST /api/health/exercises`
- `POST /api/health/workout-plans`
- `POST /api/health/workout-sessions`
- `PATCH /api/health/workout-sessions/:id`
- `POST /api/health/recipes`
- `POST /api/health/meal-plan`
- `POST /api/health/daily-log`
- `POST /api/health/grocery/generate`
- `POST /api/health/grocery/items`
- `PATCH /api/health/grocery/items/:id`
- `POST /api/health/pantry`
- `POST /api/health/progress`
- `POST /api/health/photos`
- `GET /api/health/photos/:id`
- `POST /api/health/reminders`
- `POST /api/health/suggestions`

## Protect `/dashboard` With Cloudflare Access

Do not put real personal data into MatthewOS until `/dashboard` is protected.

In Cloudflare Zero Trust:

1. Open Access > Applications.
2. Add a self-hosted application.
3. Set the application domain to `matthewschuppel.com`.
4. Protect the path `/dashboard*`.
5. Add an allow policy for your email address.
6. Test in an incognito browser before adding private data.

The app does not include custom login code yet. Cloudflare Access should sit in front of the private
route. Clerk or Auth.js can be added later if you want app-level authentication.

## API Scaffolds

Route handlers included:

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/notes`
- `POST /api/notes`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id`
- `GET /api/documents`
- `POST /api/documents/upload`
- `DELETE /api/documents/:id`
- `GET /api/gallery`

The handlers return mock data or preview responses today. Replace the comments with D1 queries and
R2 operations when you are ready to make the dashboard fully persistent.

## Optional OpenNext Cloudflare Commands

This repository includes OpenNext scripts for Cloudflare runtime builds:

```bash
npm run build
pnpm cf:build
pnpm cf:deploy
```

Before deploying with `pnpm cf:deploy`, replace the placeholder D1 database id in `wrangler.jsonc`.

## Custom Domain

For `matthewschuppel.com`, make sure the domain is active in Cloudflare DNS and connected to the
Cloudflare Pages project or Worker route. The current `wrangler.jsonc` includes routes for:

- `matthewschuppel.com/*`
- `www.matthewschuppel.com/*`

## Environment Variables

Optional:

- `NEXT_PUBLIC_SITE_URL=https://matthewschuppel.com`
- `APPLE_CALENDAR_ICS_URL=your-private-icloud-ics-url`

Keep calendar URLs private. Anyone with a published iCloud calendar URL may be able to read it.
