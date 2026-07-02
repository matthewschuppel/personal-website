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
- Public pages: `app/page.tsx`, `app/about/page.tsx`, `app/resume/page.tsx`, `app/gallery/page.tsx`, `app/contact/page.tsx`
- Dashboard shell: `components/MatthewOSDashboard.tsx`
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
