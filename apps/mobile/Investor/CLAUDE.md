# CLAUDE.md — GoDrop Invest App (Flutter)

## What this app is
The investor-facing Flutter app for GoDrop in Nigeria (**GoDrop Invest**).
Investors fund the vehicles GoDrop riders operate — Keke tricycles, city
shuttles, ride-hail cars and dispatch bikes — for a fixed term and earn
monthly payouts across multiple wallets.

Entry point: `lib/main.dart`
Design source: claude.ai/design project → `GoDrop Invest - App.html` (30 screens).
**The app ships light mode only** (the design's `body.theme-light` tokens).

## Tech stack
Same as the other GoDrop apps:
- **State management**: flutter_bloc (Cubits per feature)
- **Navigation**: go_router (`lib/app/router.dart`)
- **HTTP client**: Dio + retrofit (generated with build_runner)
- **Local storage**: flutter_secure_storage (tokens), shared_preferences (session cache)
- **Paystack checkout**: opened via url_launcher (`authorizationUrl` from the API), then verified with the matching `/verify` endpoint

## Auth model
- Register: `POST /investor/auth/register` (first/last name, email, phone, password) → phone OTP
- Verify: `POST /investor/auth/otp/verify` → **access + refresh token pair**
- Sign in: `POST /investor/auth/login` with email **or** phone + password
- `AuthInterceptor` (a `QueuedInterceptor`) auto-refreshes on 401 via `POST /investor/auth/refresh` and retries once; both tokens live in `TokenStorage`
- Phone input accepts local `0803…` and normalizes to `+234…`

## Money convention
**Everything is integer Kobo** (`amountKobo`, `balanceKobo`, …) — unlike the
vendor wallet there are no Naira-decimal endpoints. Format with `formatKobo()`
(`shared/utils/currency.dart`). Rates come as basis points
(`projectedRoiBps: 3200` = 32%, `monthlyRateBps: 540` = 5.4%/mo) — format with
`formatBps()`.

## Domain glossary
- **Asset** — a vehicle open for fractional investment (class: KEKE, SHUTTLE, RIDE_CAR, BIKE)
- **Plan** — Starter (6 mo) / Rider (12 mo) / Fleet (18 mo); sets lock period + monthly rate
- **Investment** — amount × plan on an asset; generates an `InvestmentPayout` schedule, capital returns at maturity
- **Wallets** — Main (invest from), Payout (monthly returns land here), Flow Safe (interest-bearing vaults, flexible or locked)

## Project structure
```
lib/
  main.dart               # MultiBlocProvider + app bootstrap
  app/
    investor_app.dart     # MaterialApp.router (light theme only)
    router.dart           # go_router; StatefulShellRoute with 5 tabs
    theme.dart            # InvestColors — light tokens from the design kit
  features/
    splash/ onboarding/ auth/          # screens 01–07
    home/ assets/                      # screens 08–11
    invest/                            # screens 12–16 (InvestFlowCubit carries the 5-step state)
    portfolio/                         # screens 17–18
    wallet/ safe/ transactions/        # screens 19–23
    profile/                           # screens 24–30 (details, bank, KYC, settings, support, notifications)
  shared/
    api/                  # DioClient + retrofit services (run build_runner!)
    models/               # json_serializable models mirroring openapi.yaml
    services/             # TokenStorage (access+refresh), UserPrefs
    utils/                # formatKobo/formatBps, dates, parseDioError
    widgets/              # InvestButton, InvestField, VehicleTile, MainShell, TxTile…
```

## Key conventions
- Bottom tabs: Home · Safe · My Assets · Transaction · Profile (`MainShell`)
- All API calls live in `lib/shared/api/` services — never call Dio from widgets
- API envelope is `{ success, ...payload }`; errors `{ success: false, error }`
  (parse via `parseDioError` in `shared/utils/errors.dart`)
- `VehicleTile` renders the dark gradient vehicle imagery — it stays dark even
  in light mode (it reads as imagery, not surface)
- Full contract: `apps/backend/openapi.yaml`, sections `/investor/*`

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
