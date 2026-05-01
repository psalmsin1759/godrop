# CLAUDE.md — @godrop/backend

## What this app is
The Express.js REST API powering Godrop — an on-demand delivery and logistics platform in Nigeria.
It handles auth, orders, vendor management, rider assignment, truck bookings, and real-time tracking.

## Tech stack
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js v4
- **Database**: PostgreSQL via Prisma ORM
- **Cache / Realtime**: Redis (ioredis)
- **Auth**: JWT (access + refresh token pattern)
- **Validation**: Zod
- **Payments**: Paystack (Nigerian payment gateway — NOT Stripe)
- **SMS / OTP**: Termii (Nigerian SMS provider)
- **Maps**: Google Maps Platform (Directions, Geocoding, Distance Matrix)
- **File uploads**: Cloudinary
- **Shared types**: `@godrop/shared-types` (workspace package)

## Project structure
```
src/
  index.ts          # Express app entry point
  routes/           # Route files (auth, orders, vendors, riders, truck, tracking)
  controllers/      # Route handlers
  services/         # Business logic (orderService, riderService, paymentService...)
  middleware/        # Auth, validation, error handling
  utils/            # Helpers (geocode, formatKobo, generateTrackingCode...)
  prisma/           # schema.prisma + migrations
```

## Key conventions
- All monetary values are stored and returned in **Kobo** (₦ × 100), never Naira floats
- Phone numbers must be in E.164 format: `+234XXXXXXXXXX`
- All responses follow `ApiResponse<T>` from `@godrop/shared-types`
- Use Zod schemas for all request body validation — place schemas in `src/validators/`
- Route files only register routes; logic goes in controllers; DB/external calls go in services
- All errors must be caught and passed to `next(err)` — never `res.send` from catch blocks

## API contract
The full OpenAPI spec lives at `openapi.yaml` in this directory.
Always keep it in sync when adding or changing endpoints.

## Environment
Copy `.env.example` to `.env` and fill in values.
Never hardcode secrets. Never commit `.env`.

## Running locally
```bash
pnpm dev         # starts ts-node-dev with hot reload on port 4000
pnpm build       # compiles to dist/
pnpm start       # runs compiled output
```

## Nigerian context — important
- Default currency: Nigerian Naira (₦)
- Default country code: `NG`
- States to support at launch: Lagos, Abuja, Port Harcourt, Ibadan, Kano
- Payment gateway: Paystack (not Stripe) — use `@paystack/paystack-sdk`
- SMS: Termii API — used for OTP verification on phone numbers
- Traffic and routing must account for Lagos traffic patterns (use Google Maps with departure_time)
