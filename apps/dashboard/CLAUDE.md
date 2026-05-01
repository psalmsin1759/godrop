# CLAUDE.md — @godrop/dashboard

## What this app is
The internal admin and operations dashboard for Godrop.
Used by Godrop ops team to monitor orders, manage riders/vendors, resolve disputes, and view analytics.

## Tech stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Tables**: TanStack Table v8
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Auth**: NextAuth.js (admin-only, role: "admin")
- **Maps**: Google Maps JS API (for live rider tracking view)
- **State**: redux toolkit (for global UI state like selected order, map filters)
- **data fetching**: RTK Query
- **Data fetching**: SWR with auto-revalidation for live data panels
- **Deployment**: Vercel (separate from landing — different subdomain: ops.godrop.ng)

## Key sections to build
```
/                        # Overview: daily stats, active orders, online riders
/orders                  # Order table — filter by status, category, date
/orders/[id]             # Order detail: timeline, customer, rider, items, map
/riders                  # Rider list — online status, location, rating, history
/vendors                 # Vendor list — active/inactive, orders, disputes
/trucks                  # Truck bookings — upcoming, in-progress, completed
/customers               # Customer list — search, order history, wallet balance
/analytics               # Charts: GMV, orders/day, delivery time, category split
/disputes                # Flagged orders, complaints, resolution flow
/settings                # Ops config (delivery fee rules, surge, coverage zones)
```

## Key conventions
- App Router only — no `pages/` directory
- All data fetching in Server Components or SWR hooks — no direct API calls in render
- Use `@godrop/shared-types` for all type imports — never redefine Order, User, etc.
- shadcn/ui for all UI primitives (Button, Table, Dialog, Badge, Select, etc.)
- Monetary values: always display as Naira (₦) formatted from Kobo — use `formatNaira(kobo)` util
- Tables must be sortable, filterable, and paginated (TanStack Table)
- All admin actions (cancel order, deactivate rider) must show a confirmation dialog

## API
- Base URL: from `NEXT_PUBLIC_API_URL` env variable
- Auth: Admin JWT stored in NextAuth session, sent as `Authorization: Bearer <token>`
- Refer to `apps/backend/openapi.yaml` for all available endpoints

## Real-time features
- Active orders panel: poll every 10s via SWR `refreshInterval`
- Live rider map: WebSocket connection to `wss://api.godrop.ng/ws/riders`
- New order notifications: use browser Notification API

## Environment
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Running locally
```bash
pnpm dev     # starts on http://localhost:3001
pnpm build
pnpm start
```
