# LinenTag website

Marketing site for LinenTag: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Framer Motion, and shadcn-style components (Radix primitives + `class-variance-authority`).

```bash
cp .env.example .env.local   # set LINENTAG_API_URL so waitlist sign-ups are stored
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
```

## Structure

```
src/app/                 Routes: /, /about, /features, /how-it-works, /pricing, /contact, /careers,
                         /blog, /blog/[slug], /nfc-tags, /privacy, /terms, /cookies
                         api/waitlist, api/contact   Form endpoints (server-side validation)
                         sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg
src/components/ui/       Button, Card, form fields, Accordion (shadcn-style; components.json is set up for the shadcn CLI)
src/components/sections/ Page sections (hero, features, FAQ, waitlist…)
src/components/visuals/  Phone mockups and app screens, rendered in code (no image files)
src/components/layout/   Header, footer, cookie consent
src/lib/content/         Copy: marketing sections, FAQ, blog posts
src/lib/site.ts          Site name, URL, keywords, contact email, social links, navigation
public/labels.html       The printable label maker, served at /labels (the app links here)
```

## Forms

- **Waitlist** (`/api/waitlist`) validates with the same schema as the browser, drops bot submissions (honeypot field), and stores sign-ups through the LinenTag API (`POST /waitlist` on `server/`, table `waitlist`). Connect a newsletter tool from either place later.
- **Contact** (`/api/contact`) forwards messages as JSON to `CONTACT_WEBHOOK_URL` (Slack, Zapier, Make…). Without it, messages are only logged.

## Analytics and cookies

Nothing but the visitor's consent choice is stored until they click "Accept analytics". Analytics (Plausible, cookie-free) load only after that, and only if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. Send custom events with `track()` from `src/lib/analytics.ts`.

## Before launch

- [ ] **Testimonials** are examples (marked "Example" on the page). Replace them with real, permitted quotes in `src/lib/content/marketing.ts`, or set `SHOW_TESTIMONIALS = false`.
- [ ] **Product claims**: confirm wash, heat and lifespan wording against your tag supplier's specs and your own wash tests (`productDetails` and `faqs`).
- [ ] **Legal pages** are drafts with a visible notice. Have them reviewed, then remove the notice in `src/components/legal-page.tsx`.
- [ ] **Careers** roles are examples (`src/app/careers/page.tsx`).
- [ ] **Contact email and social links** in `src/lib/site.ts`.
- [ ] **Domain**: set `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, Open Graph).
- [ ] **Shop link**: set `SHOP_URL` in `src/app/nfc-tags/page.tsx` when tag kits go on sale.

## Deploying

Vercel works with no configuration (set the env vars in the project settings). Any Node host also works: `npm run build && npm start`. Point the mobile app at this site by setting `EXPO_PUBLIC_WEB_URL` in `mobile/.env`, so its label maker and NFC tag links open here.
