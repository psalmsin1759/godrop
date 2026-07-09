# CLAUDE.md — Godrop Vendor App (Flutter)

## What this app is
The vendor-facing Flutter app for Godrop in Nigeria.
Vendor admins (restaurant, grocery, retail, and pharmacy partners) use it to manage incoming orders, their menu/catalog, wallet payouts, team members, and store settings.

Entry point: `lib/main.dart`

## Tech stack
- **Framework**: Flutter (latest stable) + Dart
- **State management**: flutter_bloc (Cubits per feature)
- **Navigation**: go_router (`lib/app/router.dart`)
- **HTTP client**: Dio + retrofit (generated with build_runner)
- **Local storage**: flutter_secure_storage (JWT), shared_preferences (session cache)
- **Image picking**: image_picker (product photos → `/vendor-admin/catalog/image`)

## Auth model (differs from customer app)
- Vendor admins sign in with **email + password** at `POST /api/v1/admin/login`
- The API returns a **single JWT (7-day expiry)** — there is **no refresh token**
- Roles: `OWNER` > `MANAGER` > `STAFF`. UI gates via `SessionCubit`
  (`isOwner`, `isManagerOrAbove`); the API enforces the same rules server-side:
  - STAFF: catalog + orders (accept/preparing/ready/reject)
  - MANAGER: + analytics, cancel order, view settings/team/audit logs
  - OWNER: + update store settings, manage team, withdraw from wallet
- Forgot password sends an email reset link (handled by the dashboard web app)
- New vendors apply in-app via `POST /vendor` (unauthenticated multipart:
  business info, lat/lng, owner account, CAC registration + government ID
  images ≤10 MB; utility bill optional). The vendor is created as PENDING —
  the owner can sign in, but the store is only listed once a system admin
  approves it. Phone input accepts local `0803...` and normalizes to `+234`.

## Money convention — read carefully
- **Catalog, orders, analytics** endpoints speak **integer Kobo**
  (`priceKobo`, `totalKobo`, `revenueKobo`) → format with `formatKobo()`
- **Wallet** endpoints speak **Naira decimals** (`balance`, `amount`;
  withdraw body takes `amount` in Naira, min ₦100) → format with `formatNaira()`

## Project structure
```
lib/
  main.dart
  app/
    vendor_app.dart     # MaterialApp + go_router setup
    router.dart
    theme.dart          # Godrop brand colors/typography (same as customer app)
  features/
    splash/             # Token check → dashboard or login
    auth/               # Email/password login, forgot password
    onboarding/         # New-vendor application wizard (POST /vendor, multipart)
    dashboard/          # Analytics summary, revenue chart, store open toggle
    orders/             # Order list w/ status filters, detail, transitions
    catalog/            # Products + categories CRUD, image upload
    wallet/             # Balance, transactions, bank account, withdrawals
    team/               # Invite/role-change/remove members (OWNER)
    settings/           # Store settings + opening-hours editor (view MANAGER+, edit OWNER)
    profile/            # More tab, edit profile, change password,
                        # notifications inbox, audit logs, SessionCubit
  shared/
    api/                # DioClient + retrofit services (run build_runner!)
    models/             # json_serializable models mirroring the API
    services/           # TokenStorage, UserPrefs
    utils/              # formatNaira/formatKobo, date helpers
    widgets/            # GodropButton, GodropField, MainShell, StatusChip...
```

## Key conventions
- Same Godrop theme as the customer app (`lib/app/theme.dart` is a copy — keep in sync)
- All API calls live in `lib/shared/api/` services — never call Dio from widgets
- API envelope is `{ success, ...payload }`; errors are `{ success: false, error }`
  (parse via `parseDioError` in `features/auth/bloc/auth_cubit.dart`)
- Use `go_router` for navigation — no `Navigator.push` in feature code
- Order status transitions the vendor can make:
  `PENDING → ACCEPTED (accept) | CANCELLED (reject)`,
  `ACCEPTED → PREPARING | READY_FOR_PICKUP`, `PREPARING → READY_FOR_PICKUP`,
  and MANAGER+ can cancel any pre-pickup order. Reject/cancel of a PAID order
  auto-refunds the customer's wallet server-side.
- Opening hours (`shared/models/opening_hours.dart`) mirror
  `apps/backend/src/utils/vendorHours.ts`: canonical keys `sun`–`sat`,
  `{open, close}` in HH:mm Africa/Lagos time, null = closed, overnight ranges
  (close <= open) supported. An absent map means "no restriction"; an empty or
  all-null map means closed all week — never send `{}` to "clear" hours.

## API
- Base URL (prod): `https://api.naijagodrop.com/api/v1`
- Auth: `Authorization: Bearer <token>` on every `/vendor-admin/*` call
- Full contract: `apps/backend/openapi.yaml` (sections `/vendor-admin/*`, `/admin/login`)

## Codegen
After changing anything in `shared/models/` or `shared/api/services/`:
```bash
dart run build_runner build --delete-conflicting-outputs
```

## Running locally
```bash
flutter pub get
flutter run                  # on connected device or emulator
flutter build apk            # release APK
```
