# Matthew Schuppel Website

A minimal public personal website plus a private-ready Notion-inspired dashboard called MatthewOS.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Customize

- Personal details: `data/site.ts`
- MatthewOS mock data: `data/matthewos.ts`
- Styling: `tailwind.config.ts` and `app/globals.css`
- Public pages: `app/page.tsx`, `app/about/page.tsx`, `app/resume/page.tsx`, `app/contact/page.tsx`, `app/gallery/page.tsx`
- Dashboard shell: `components/MatthewOSDashboard.tsx`
- Previous structure snapshot: `docs/previous-website-structure.md`

## Gallery Storage

The public Gallery page stores uploaded travel photos in Cloudflare R2. MatthewOS stores user-captured
dashboard input in R2 so changes can follow you across devices. The current bindings expect an R2
bucket named `mws-gallery` in `wrangler.jsonc`.

Before deploying, create that bucket in Cloudflare R2 or change `bucket_name` in `wrangler.jsonc` to
match the bucket you already created.

## Apple Calendar

The dashboard can show upcoming Apple Calendar events from an iCloud calendar subscription link.
Set `APPLE_CALENDAR_ICS_URL` as a Cloudflare text variable or secret. For local development, add it
to `.env.local`.

In Apple Calendar, publish or share the calendar, copy the `.ics` subscription URL, and use that as
the value. Keep that URL private because anyone with the link may be able to read that calendar.

## Deploy To Cloudflare

Because R2-backed dashboard input and gallery storage need server-side bindings, deploy the full app
as a Next.js app on Cloudflare Workers using the OpenNext Cloudflare adapter.

```bash
npm install
npm run build
pnpm cf:build
pnpm cf:deploy
```

Before deploy:

1. Add `APPLE_CALENDAR_ICS_URL` as a Cloudflare variable if you want Apple Calendar events.
2. Update `NEXT_PUBLIC_SITE_URL` in `wrangler.jsonc`.
3. Create the R2 bucket named in `wrangler.jsonc` under `r2_buckets`.
4. Protect `/dashboard` with Cloudflare Access, Clerk, or Auth.js when ready.
5. Deploy with `pnpm cf:deploy`.

## Custom Domain On Cloudflare

After deployment, open the Cloudflare dashboard and attach your custom domain to the deployed
Worker route. Set the route to your domain, for example `yourdomain.com/*`, and make sure DNS for
the domain is managed by Cloudflare.

## Cloudflare Pages Settings

For a static-only public version, use:

- Build command: `npm run build`
- Output directory: `out`

The current R2-backed MatthewOS build is not a pure static export because R2 requires Cloudflare
runtime bindings. Use Cloudflare Workers/OpenNext for the full version, or split the public site into
a static Pages project later.

## Deploy And Connect A Custom Domain On Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. In Vercel, open Project Settings > Domains and add your custom domain.
4. Update your DNS records as instructed by Vercel.
5. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
