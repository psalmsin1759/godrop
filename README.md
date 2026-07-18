# Godrop

**On-demand delivery and logistics platform for Nigeria.**

Godrop connects customers, vendors, independent delivery riders, internal operations staff, and — through a dedicated product line, **GoDrop Invest** — retail investors who fund the vehicles riders operate. The goal is nationwide coverage across Nigeria; the platform launches first in Lagos to prove the model, then expands to Abuja, Port Harcourt, Ibadan, and Kano.

Services offered:
- Food delivery
- Grocery delivery
- Retail & pharmacy product delivery
- Parcel delivery (multi-dropoff courier)
- Truck booking for relocation
- GoDrop Invest — fractional investment in rider vehicles (Keke tricycles, city shuttles, ride-hail cars, dispatch bikes)

Full **[Product Requirements Document](./Godrop-PRD.pdf)** and **[Software Technical Documentation](./Godrop-Technical-Documentation.pdf)** are included in this repo — read those first for the complete picture of scope, business rules, architecture, and data model. This README is the practical, get-things-running companion to those two documents.

---

## Table of contents

- [Repository structure](#repository-structure)
- [Apps at a glance](#apps-at-a-glance)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend API](#1-backend-api)
  - [Ops dashboard](#2-ops-dashboard)
  - [Landing site](#3-landing-site)
  - [Mobile apps](#4-mobile-apps-flutter)
- [Environment variables](#environment-variables)
- [Data model](#data-model)
- [API contract](#api-contract)
- [Core conventions](#core-conventions)
- [Order lifecycle](#order-lifecycle)
- [Nigerian market considerations](#nigerian-market-considerations)
- [Security notes](#security-notes)

---

## Repository structure

```
godrop/
├── apps/
│   ├── backend/            # Node.js + Express REST/WebSocket API (@godrop/backend)
│   ├── dashboard/           # Next.js internal ops dashboard (@godrop/dashboard)
│   ├── landing/             # Next.js public marketing site
│   └── mobile/
│       ├── Customer/        # Flutter — customer-facing app
│       ├── Rider/           # Flutter — rider-facing app
│       ├── Vendor/          # Flutter — vendor admin app
│       └── Investor/        # Flutter — GoDrop Invest app
├── Godrop-PRD.pdf
├── Godrop-Technical-Documentation.pdf
└── README.md                # you are here
```

> **Note on tooling:** the project is intended to run as a Turborepo + pnpm-workspaces monorepo (with a shared `packages/shared-types` package, root `turbo.json`/`pnpm-workspace.yaml`). As of this writing those root config files and the `packages/` directory are **not present** in the repo — each app under `apps/` currently has its own independent `package.json` and is run standalone (see [Getting started](#getting-started) below). Treat the monorepo-orchestration setup as the target state, not the current one, until those files are added.

---

## Apps at a glance

| App | Path | Stack | Port (dev) | Consumers |
|---|---|---|---|---|
| **Backend API** | `apps/backend` | Node 20, Express 4, TypeScript, Prisma/PostgreSQL, Redis, WebSocket | `4000` | All apps below |
| **Ops Dashboard** | `apps/dashboard` | Next.js 14 (App Router), Tailwind, shadcn/ui, Redux Toolkit + RTK Query, SWR | `3001` | Internal Godrop staff |
| **Landing site** | `apps/landing` | Next.js 16 (App Router), Tailwind v4, Framer Motion, GSAP | `3000` | Public / marketing |
| **Customer app** | `apps/mobile/Customer` | Flutter, flutter_bloc, go_router, Dio, Google Maps, Paystack SDK | — | End customers |
| **Rider app** | `apps/mobile/Rider` | Flutter, flutter_bloc, go_router, Dio, Google Maps, FCM | — | Delivery riders |
| **Vendor app** | `apps/mobile/Vendor` | Flutter, flutter_bloc, go_router, Dio + retrofit | — | Restaurant/store admins |
| **Investor app** | `apps/mobile/Investor` (GoDrop Invest) | Flutter, flutter_bloc, go_router, Dio + retrofit | — | Retail investors |

All five client apps (four Flutter apps + the dashboard) speak to the **same backend API** and the **same OpenAPI contract** — there is one source of truth for the data model and endpoints.

---

## Tech stack

**Backend**
Node.js 20 · TypeScript · Express 4 · PostgreSQL via Prisma ORM · Redis (ioredis) · JWT auth · Zod validation · Paystack (payments) · Termii (SMS/OTP) · Google Maps Platform (routing/geocoding) · Cloudinary (uploads) · Firebase Admin (push) · `ws` (WebSocket) · Nodemailer · PDFKit

**Web (dashboard + landing)**
Next.js (App Router only) · TypeScript · Tailwind CSS · shadcn/ui + Radix · TanStack Table · Recharts · React Hook Form + Zod · NextAuth (dashboard) · Redux Toolkit / RTK Query · SWR · Framer Motion / GSAP

**Mobile (all four Flutter apps)**
Flutter (Dart SDK `>=3.0.0 <4.0.0`) · flutter_bloc (Bloc/Cubit) · go_router · Dio (+ retrofit/codegen in Vendor & Investor) · freezed + json_serializable · flutter_secure_storage · Firebase Cloud Messaging · Google Maps Flutter + Geolocator

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm (this repo uses pnpm — never npm or yarn)
- PostgreSQL (local instance or a hosted connection string)
- Redis (local instance, e.g. `brew install redis && redis-server`)
- Flutter SDK (latest stable) — only needed for mobile work
- An Android emulator / physical device, or Xcode simulator, for mobile testing

Each app is currently run **independently** (no root `pnpm dev` yet — see the tooling note above).

### 1. Backend API

```bash
cd apps/backend
pnpm install
cp .env.example .env        # fill in real values — see Environment variables below
pnpm db:generate             # generate Prisma client
pnpm db:migrate               # run migrations against your DATABASE_URL
pnpm db:seed                  # optional: seed platform settings, super admin, etc.
pnpm dev                      # ts-node-dev with hot reload → http://localhost:4000
```

Other backend scripts:
```bash
pnpm build       # prisma generate + tsc → dist/
pnpm start       # prisma migrate deploy + node dist/index.js  (production)
pnpm db:push     # push schema without a migration (prototyping only)
pnpm lint
```

### 2. Ops dashboard

```bash
cd apps/dashboard
pnpm install
# create .env.local with NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (see Environment variables below)
pnpm dev          # → http://localhost:3001
```

### 3. Landing site

```bash
cd apps/landing
pnpm install
pnpm dev          # → http://localhost:3000
```

### 4. Mobile apps (Flutter)

Each Flutter app is a separate project directory with its own entry point:

```bash
cd apps/mobile/Customer   # or Rider / Vendor / Investor
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # Vendor & Investor apps use codegen (retrofit/json_serializable)
flutter run                                # Customer/Rider use -t to pick the entry point:
flutter run -t lib/main_customer.dart      # Customer app only
flutter run -t lib/main_rider.dart         # Rider app only
```

By default, mobile apps on an Android emulator point at `http://10.0.2.2:4000/api/v1` to reach a locally running backend — no extra config needed for local dev against a local backend.

---

## Environment variables

The backend's `.env.example` documents every variable the API needs — copy it to `.env` and fill in real values before running `pnpm dev`. Key groups:

| Group | Variables |
|---|---|
| Server | `PORT`, `NODE_ENV` |
| Database | `DATABASE_URL` (PostgreSQL) |
| Auth | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` |
| Payments | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` |
| SMS/OTP | `SMS_PROVIDER`, `TERMII_BASE_URL`, `TERMII_API_KEY`, `TERMII_SENDER_ID` |
| Email | `EMAIL_PROVIDER`, `MAILTRAP_*`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS` |
| Maps | `GOOGLE_MAPS_API_KEY` |
| Cache | `REDIS_URL` |
| File storage | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| CORS / links | `ALLOWED_ORIGINS`, `DASHBOARD_URL`, `APP_DOMAIN` |
| Seed | `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` |

Dashboard (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

> **See [Security notes](#security-notes) below** — the checked-in `apps/backend/.env.example` currently contains what appear to be live-looking secrets (a real database connection string, Paystack/Termii/Cloudinary keys, JWT secrets), not placeholders. Treat this as **committed secrets requiring rotation**, and never copy those actual values into new documents or share this file outside the team.

---

## Data model

The backend's Prisma schema (`apps/backend/src/prisma/schema.prisma`) defines **51 models** and **26 enums** covering:

- **Identity & auth** — `User`, `Admin`, `Vendor`, `Rider`, `Investor`, each with independent auth/token models
- **Commerce** — `Vendor` → `ProductCategory` → `Product`; the universal `Order` / `OrderItem` / `OrderEvent` model shared by all six order types
- **Money** — per-principal wallets and transactions (`Wallet`, `VendorWallet`, `BusinessWallet`, `InvestorWallet`, `RiderEarning`, etc.)
- **Investment product** — `InvestmentAsset`, `InvestmentPlan`, `Investment`, `InvestmentPayout`
- **Ops & platform** — `Business`, `PlatformSettings`, `Promotion`, `Banner`, `AuditLog`, notifications per principal

See the **Technical Documentation PDF** for the full breakdown, including the `OrderStatus` state machine and how a single `Order` table serves food/grocery/retail/pharmacy/parcel/truck via nullable, type-discriminated foreign keys.

## API contract

`apps/backend/openapi.yaml` is the single contract all apps integrate against (243 documented paths as of this writing) — **always keep it in sync** when adding or changing endpoints. It's served via `swagger-ui-express` when the backend is running. Route prefixes:

`/auth`, `/me`, `/food`, `/grocery`, `/retail`, `/pharmacy`, `/orders`, `/parcel`, `/truck`, `/payments`, `/promotions`, `/rider`, `/vendor` (public onboarding), `/vendor-admin`, `/business-admin`, `/investor`, `/admin` (dashboard/system-admin).

## Core conventions

- **Money**: stored and transmitted as **integer Kobo** (₦ × 100) almost everywhere. The one deliberate exception is the vendor app's *wallet* endpoints, which use Naira decimals — a documented divergence, not a bug. Investor rates (ROI, monthly return) are basis points, not percentages.
- **Phone numbers**: canonical E.164 format (`+234XXXXXXXXXX`); clients normalize local `0803...` input before sending to the API.
- **Auth models differ by principal**:
  | Principal | Login | Tokens |
  |---|---|---|
  | Customer / Rider | Phone + OTP | Access + refresh JWT pair |
  | Vendor admin | Email + password | Single 7-day JWT, **no refresh token** |
  | Investor | Register+OTP, or email/phone + password | Access + refresh JWT pair (auto-refresh interceptor) |
  | Dashboard admin | Email + password via NextAuth | NextAuth session |
- **API response envelope**: `{ success, ...payload }` on success, `{ success: false, error }` on failure.
- **Layering (backend)**: routes register only; controllers handle req/res; services own DB + third-party calls; every error reaches `next(err)` — never `res.send` from a catch block.

## Order lifecycle

```
PENDING → ACCEPTED → PREPARING → READY_FOR_PICKUP → PICKED_UP → IN_TRANSIT → DELIVERED
   ↓            ↓                      ↓
CANCELLED   CANCELLED              CANCELLED / FAILED
```

Vendors drive PENDING→READY_FOR_PICKUP; riders drive READY_FOR_PICKUP→DELIVERED (with per-dropoff granularity on multi-drop parcel orders). Cancelling/rejecting an already-paid order auto-refunds the customer's wallet.

## Nigerian market considerations

- Goal is **nationwide Nigeria coverage**; Lagos is the launch market used to prove the model before expanding to Abuja, Port Harcourt, Ibadan, and Kano.
- Cash-on-delivery is a first-class payment option — not all customers have cards.
- Delivery ETAs are always shown as a duration ("~25 min"), never a clock time — Lagos traffic is unpredictable.
- Address entry surfaces well-known Lagos areas (Ikeja, VI, Lekki, Yaba, Surulere) to reduce typing friction.
- Low-bandwidth UX is a first-class requirement across all mobile apps: lazy-loaded images, paginated lists.
- Payments run through **Paystack**, not Stripe; SMS/OTP runs through **Termii**, not Twilio — these are non-negotiable choices for the Nigerian market, not defaults to swap out.

## Security notes

- **Rotate the credentials in `apps/backend/.env.example`.** As checked in, the file contains what look like real values (a live PostgreSQL connection string, Paystack test keys, a Termii API key, Cloudinary secret, JWT signing secrets) rather than placeholders. Treat all of these as compromised, rotate them, and replace the file's contents with clearly-fake placeholder values before it's shared further.
- Never commit `.env` (already covered by `.gitignore`), and never hardcode secrets in source.
- All admin/vendor actions considered sensitive (cancel order, deactivate rider, wallet withdrawal approval) are recorded in `AuditLog` and reviewable/exportable from the dashboard.
