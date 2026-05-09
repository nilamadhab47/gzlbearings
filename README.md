<div align="center">

# GLZ Bearings

**Turning Trust Into Motion.**

Marketing site for GLZ Bearings — a precision industrial bearing brand.
Built with Next.js 15 (App Router), React 19, Tailwind CSS v3, Motion, and React Three Fiber.

</div>

---

## Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router) + React 19, TypeScript
- **Styling** — Tailwind CSS v3 with a custom design system (`industrial-yellow`, `deep-black`, `graphite`, `steel`, `white-smoke`); Bebas Neue display + Inter body
- **Motion** — [`motion`](https://motion.dev/) for scroll-driven and page transitions
- **3D** — [`@react-three/fiber`](https://r3f.docs.pmnd.rs/) + `@react-three/drei` for the procedural bearing hero
- **Icons** — `lucide-react` (re-exported via `src/components/Icons.tsx`)
- **Image generation (dev only)** — `@google/genai` (Gemini Nano Banana) for product imagery

## Project structure

```
app/
  layout.tsx              Root layout, SEO metadata, JSON-LD, providers
  page.tsx                Homepage
  products/page.tsx       Products catalogue
  api/enquiry/route.ts    Enquiry intake (email transport TBD)
  sitemap.ts              /sitemap.xml
  robots.ts               /robots.txt
  globals.css
src/
  App.tsx                 Homepage composition
  views/ProductsPage.tsx  Catalogue view (filters + cards)
  components/
    Navbar.tsx · MobileNav.tsx · Footer.tsx
    Logo.tsx              Brand mark wrapper (uses /public/logo.png)
    BearingHero.tsx       R3F procedural bearing
    EnquiryModal.tsx      Global enquiry form + provider
    WelcomeModal.tsx      First-visit welcome (localStorage gated)
    Icons.tsx
  lib/siteConfig.ts       SEO + brand single source of truth
public/
  logo.png  og.png  site.webmanifest  images/
scripts/
  gen-images.ts           Gemini image generator (npm run gen:images)
```

## Run locally

**Prerequisites:** Node.js 20+.

```bash
npm install
cp .env.example .env.local      # then edit values
npm run dev                     # http://localhost:3000
```

### Scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the Next dev server on :3000    |
| `npm run build`     | Production build                      |
| `npm run start`     | Run the production build              |
| `npm run lint`      | Next lint                             |
| `npm run gen:images`| Generate product imagery via Gemini   |

### Environment variables

| Var                    | Required | Purpose                                                  |
| ---------------------- | :------: | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` |    no    | Canonical origin for SEO (`metadataBase`, sitemap, OG)   |
| `GEMINI_API_KEY`       |    no    | Only needed for `npm run gen:images`                     |

## Brand assets

Drop the master brand artwork into `public/`:

- `public/logo.png` — yellow GLZ™ wordmark (used in navbar, mobile drawer, footer, welcome modal, favicon, and `Organization` JSON-LD logo)
- `public/og.png` — 1200×630 social share card

The `<Logo />` component (`src/components/Logo.tsx`) renders a typographic fallback if `logo.png` is missing, so the site never breaks in dev.

## Features

- **Responsive** across mobile / tablet / desktop / 3xl ultrawide (1760+)
- **3D hero** — procedural bearing in vertical orientation with mouse parallax
- **Scroll-driven process section** with animated SVG line
- **Products catalogue** with sidebar filters (collapsible accordion on mobile), search, tabs
- **Global enquiry modal** — opened from any CTA via `useEnquiry().open({ topic, productSlug, productName })`
- **First-visit welcome modal** — shown once per browser, gated by `localStorage` key `glz:welcome:v1`
- **SEO** — Next 15 `Metadata` API: title template, OG, Twitter card, robots, manifest, theme-color; auto-generated `sitemap.xml` and `robots.txt`; JSON-LD `Organization` + `WebSite`

## Enquiry email transport

The form POSTs to `app/api/enquiry/route.ts`. Email delivery is not wired yet — see the `TODO` in that file. Recommended providers:

- **Resend** — 3 000/mo free, native React Email templates, best DX with Next
- **Web3Forms** — 250/mo free, no SMTP/domain setup
- **Brevo** — 300/day free, SMTP + API

