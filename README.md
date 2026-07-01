# Personal Website

A multipurpose Next.js personal site with public pages and a password-protected personal operating system dashboard.

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `DASHBOARD_PASSWORD` in `.env.local`, then visit `/dashboard`.

## Customize

- Personal details: `data/site.ts`
- Dashboard placeholders: `data/dashboard.ts`
- Styling: `tailwind.config.ts` and `app/globals.css`
- Public pages: `app/page.tsx`, `app/about/page.tsx`, `app/resume/page.tsx`, `app/contact/page.tsx`

## Deploy To Cloudflare

This app includes a password-protected dashboard, middleware, cookies, and server actions. Because
of that, deploy it as a full-stack Next.js app on Cloudflare Workers using the OpenNext Cloudflare
adapter. Cloudflare Pages is best for static Next exports; this app is not a pure static export.

```bash
pnpm install
pnpm cf:build
pnpm cf:preview
pnpm cf:deploy
```

Before deploy:

1. Set a strong `DASHBOARD_PASSWORD` secret:

   ```bash
   pnpm wrangler secret put DASHBOARD_PASSWORD
   ```

2. Update `NEXT_PUBLIC_SITE_URL` in `wrangler.jsonc`.
3. Update the Cloudflare project name in `wrangler.jsonc` if desired.
4. Deploy with `pnpm cf:deploy`.

## Custom Domain On Cloudflare

After deployment, open the Cloudflare dashboard and attach your custom domain to the deployed
Worker route. Set the route to your domain, for example `yourdomain.com/*`, and make sure DNS for
the domain is managed by Cloudflare.

## Static Cloudflare Pages Option

If you want a manual Cloudflare Pages upload instead, convert the app to static-only first. That
means removing middleware, server actions, cookie authentication, and any private dashboard behavior
that depends on server runtime. Then run `next build` with a static export configuration and upload
the generated static output.

## Deploy And Connect A Custom Domain On Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add `DASHBOARD_PASSWORD` as a production environment variable.
4. In Vercel, open Project Settings > Domains and add your custom domain.
5. Update your DNS records as instructed by Vercel.
6. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
