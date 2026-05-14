# CLAUDE.md

## Project Overview

You are building a modern, high-performance landing page for Godrop, an on-demand delivery and logistics platform in Nigeria.

Godrop enables:

Food delivery
Grocery delivery
Retail product delivery
Parcel delivery
Truck booking for relocation

Target audience:

Urban Nigerians (especially Lagos)
Mobile-first users
Young professionals, families, SMEs


## Tech Stack
Framework: Next.js 16 (App Router)
Language: TypeScript
Styling: Tailwind CSS v4, shadcn/ui
Animations: Framer Motion, GSAP
Architecture: Component-based, modular, scalable
Forms: React Hook Form + Zod
data fetching: RTK Query
Data fetching: SWR with auto-revalidation for live data panels
Deployment: Vercel (separate from dashboard)

## Architecture
app: contains routes and server components
components/ui: contains reusable design-system
lib: contains utilities, api helpers and shared config
features: feature-specific business logic
types: shared typescript types

Rules
- move repeated ui into reusable components
- keep side effects out of UI components when possible
- prefer server-side data fetching unless client interactivity is required

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```


- `app/layout.tsx` — root layout; sets up Geist Sans/Mono fonts as CSS variables and a full-height flex column body
- `app/page.tsx` — home page (currently the default scaffold)
- `app/globals.css` — global styles; entry point for Tailwind

Path alias `@/*` maps to the repo root, so `@/app/...`, `@/components/...`, etc. work without relative paths.

ESLint uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` (flat config via `eslint.config.mjs`).
