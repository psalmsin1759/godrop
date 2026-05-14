# Godrop — Landing Page

A modern, high-performance marketing landing page for **Godrop**, Nigeria's on-demand delivery and logistics platform. Built with Next.js 16, Tailwind CSS v4, Framer Motion, and GSAP.

---

## About Godrop

Godrop connects urban Nigerians with fast, reliable same-day delivery for:

- Food & restaurants
- Groceries
- Retail products
- Parcel delivery
- Truck booking for relocations

Target audience: urban Nigerians (especially Lagos), mobile-first users, young professionals, families, and SMEs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion + GSAP + ScrollTrigger |
| UI Components | shadcn/ui |
| Linting | ESLint (eslint-config-next) |

---

## Project Structure

```
godrop/
├── app/
│   ├── layout.tsx        # Root layout — Geist Sans/Mono fonts, full-height body
│   ├── page.tsx          # Home page — assembles all sections
│   └── globals.css       # Global styles + Tailwind entry point
├── components/
│   ├── Navbar.tsx         # Sticky nav — slides in on load, darkens on scroll
│   ├── HeroSection.tsx    # Full-screen hero with GSAP parallax background
│   ├── DescriptionSection.tsx  # Animated intro text with line-draw effect
│   ├── StatsSection.tsx   # Count-up stats (50k+ deliveries, 12 cities, 2k+ partners)
│   ├── ReviewsSection.tsx # Auto-scrolling reviews marquee + tabbed feature breakdown
│   ├── PhoneMockupSection.tsx  # Staggered phone mockup reveal
│   ├── BuiltForSection.tsx     # Audience targeting section
│   ├── WhySection.tsx     # GSAP card-stack scroll — panels stack with 10vh peek
│   ├── FAQSection.tsx     # Accordion FAQ in circular bordered cards
│   ├── CTASection.tsx     # Download call-to-action with star rating
│   └── Footer.tsx         # Nav, social icons, App Store/Google Play badges, legal links
├── lib/
│   └── animations.ts      # Shared Framer Motion variants (fadeUp, fadeIn, slideLeft, etc.)
└── public/                # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## Key Features

### Scroll Animations
- **GSAP ScrollTrigger** powers the `WhySection` card-stack — 4 full-screen panels slide in sequentially, each stacking over the previous with a 10vh peek strip
- **Framer Motion** `whileInView` triggers fade/slide animations on every section as it enters the viewport
- **GSAP parallax** on the hero background (30% scroll speed offset)

### Sections

| Section | Description |
|---|---|
| Navbar | Transparent → dark on scroll; links animate in staggered |
| Hero | Full-screen with warm gradient parallax; App Store + Google Play CTAs |
| Description | Animated dash line + fade-up copy |
| Stats | Count-up numbers triggered on scroll |
| Reviews | Infinite-scroll marquee of customer reviews; tabbed delivery categories |
| Phone Mockup | Staggered phone image reveal |
| Built For | Audience segments with visual layout |
| Why It Works | GSAP card-stack — Speed / Reliability / Same-day delivery |
| FAQ | Expandable accordion with animated height |
| CTA | Star rating + download prompt |
| Footer | Full nav, legal links, store badges, large GODROP watermark |

---

## Architecture Notes

- All interactive components use `"use client"` — data fetching stays server-side where possible
- Shared animation variants live in `lib/animations.ts` to keep components clean
- Path alias `@/*` maps to the repo root — use `@/components/...`, `@/lib/...`, etc.
- Tailwind v4 uses flat config via `postcss.config.mjs` and `@import "tailwindcss"` in globals

---

## Deployment

Deploy instantly on [Vercel](https://vercel.com):

```bash
vercel
```

Or connect the GitHub repo to Vercel for automatic deployments on every push to `main`.
