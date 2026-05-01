# CLAUDE.md — Godrop Monorepo

## What is Godrop
Godrop is an on-demand delivery and logistics platform for Nigeria.

**Services:**
- Food delivery
- Grocery delivery
- Retail product delivery
- Parcel delivery
- Truck booking for relocation

**Launch market:** Lagos, Nigeria (expand to Abuja, PH, Ibadan next)

## Monorepo structure
```
godrop/
├── apps/
│   ├── backend/       # Node.js + Express API (@godrop/backend)
│   ├── mobile/        # Flutter apps — customer app + rider app (separate entry points)
│   ├── landing/       # Next.js public marketing site (@godrop/landing)
│   └── dashboard/     # Next.js internal ops dashboard (@godrop/dashboard)
├── packages/
│   ├── shared-types/  # TypeScript types shared across all JS/TS apps
│   └── ui/            # (future) Shared React component library
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Tooling
- **Monorepo**: Turborepo + pnpm workspaces
- **Language**: TypeScript everywhere (except Flutter/Dart)
- **Package manager**: pnpm (always — never npm or yarn in this repo)

## Recommended build order
1. `packages/shared-types` — define all core types first
2. `apps/backend` — build API, generate/maintain `openapi.yaml`
3. `apps/dashboard` — most complex frontend, benefits from full API context
4. `apps/landing` — simpler, reuses patterns from dashboard
5. `apps/mobile` — use `openapi.yaml` to generate Dart service layer

## Running everything
```bash
pnpm install          # install all workspaces
pnpm dev              # run all apps in parallel via Turborepo
pnpm dev:backend      # backend only
pnpm dev:landing      # landing only
pnpm dev:dashboard    # dashboard only
```

## Important context for Claude
- Nigerian market: use Paystack (not Stripe), Termii (not Twilio) for SMS
- Currency: Nigerian Naira (₦). Store values in Kobo (integer). Display as Naira.
- Phone format: +234XXXXXXXXXX (E.164)
- Each app has its own CLAUDE.md with detailed instructions — always read it when working in that app
- The OpenAPI spec at `apps/backend/openapi.yaml` is the contract between all apps — keep it up to date
