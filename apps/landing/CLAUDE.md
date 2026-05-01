# CLAUDE.md — @godrop/landing

## What this app is
The public marketing website for Godrop — an on-demand delivery and logistics platform in Nigeria.
Its goal is to convert visitors into app downloads (customers) and sign-ups (vendors, riders).

## Tech stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod
- **CMS**: (TBD — consider Contentlayer or Sanity for blog/press)
- **Analytics**: Google Analytics 4 + Meta Pixel
- **Deployment**: Vercel

## Pages to build
```
/                   # Hero + value props + how it works + app download CTAs
/services           # Food, Grocery, Retail, Parcel, Truck — each with detail
/for-riders         # Rider/driver signup and benefits
/for-vendors        # Vendor onboarding info + waitlist
/about              # Company story, team, mission
/contact            # Contact form
/blog               # (future) News and updates
```

## Key conventions
- App Router only — no `pages/` directory
- All components go in `src/components/` and are server components by default
- Mark client components explicitly with `"use client"` only when needed (event handlers, animations)
- Tailwind only — no CSS modules, no styled-components
- Images: use `next/image` for all images, lazy load, provide explicit width/height
- All external links open in new tab with `rel="noopener noreferrer"`

## Brand
- **Primary color**: `#00A651` (Godrop green)
- **Accent**: `#FF6B00` (orange — used for CTAs)
- **Font**: Inter (already in Tailwind default stack)
- **Tone**: Energetic, trustworthy, local — speak like a Lagos startup, not a Silicon Valley corp
- Use Nigerian English where appropriate ("dispatch", "logistics", not "shipping")

## API integration
- Landing page is mostly static — no auth required
- Only API call needed: vendor/rider waitlist form submission (`POST /api/v1/waitlist`)
- Base URL: from `NEXT_PUBLIC_API_URL` env variable

## SEO
- Every page needs: title, description, og:image, og:title
- Target keywords: "food delivery Nigeria", "delivery app Lagos", "send parcel Lagos", "truck hire Nigeria"
- Use structured data (JSON-LD) on the homepage

## Environment
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX
```

## Running locally
```bash
pnpm dev     # starts on http://localhost:3000
pnpm build
pnpm start
```
