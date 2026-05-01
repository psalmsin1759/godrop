# CLAUDE.md — Godrop Mobile App (Flutter)

## What this app is
Two Flutter apps sharing a codebase — a **customer app** and a **rider app** — both targeting Nigerian users.

- **Customer app** (`lib/main_customer.dart`): Place food, grocery, retail, and parcel delivery orders; book trucks; track orders live.
- **Rider app** (`lib/main_rider.dart`): Accept delivery jobs, update job status, share live location.

Both apps share models, API services, widgets, and utilities under `lib/shared/`.

## Tech stack
- **Framework**: Flutter (latest stable) + Dart
- **State management**: flutter_bloc (prefer `Bloc` for complex event-driven flows, `Cubit` for simple state)
- **Navigation**: go_router (separate router config per app entry point)
- **HTTP client**: Dio (with interceptors for JWT refresh)
- **Maps**: Google Maps Flutter + Geolocator
- **Local storage**: flutter_secure_storage (tokens), shared_preferences (settings)
- **Push notifications**: Firebase Cloud Messaging (FCM)
- **Real-time tracking**: WebSocket via `web_socket_channel`
- **Payments**: Paystack Flutter SDK (customer app only)
- **Image picking**: image_picker + cached_network_image

## Project structure
```
lib/
  main_customer.dart    # Customer app entry point
  main_rider.dart       # Rider app entry point
  app/
    customer_app.dart   # Customer MaterialApp + router setup
    rider_app.dart      # Rider MaterialApp + router setup
    theme.dart          # Godrop brand colors and typography
  features/
    auth/               # Login, register, OTP verification (shared)
    home/               # Customer: category selector (food, grocery, retail, parcel, truck)
    orders/             # Customer: order placement, cart, checkout
    tracking/           # Customer: live order tracking with map
    truck/              # Customer: truck booking flow
    profile/            # Customer: user profile, saved addresses, wallet
    rider/              # Rider: job list, accept job, navigate to pickup/dropoff
  shared/
    api/                # Dio client + API service classes
    models/             # Dart models (mirror @godrop/shared-types)
    widgets/            # Reusable UI components
    utils/              # formatKobo, phoneValidation, etc.
```

## Bloc conventions
- One Bloc/Cubit per feature screen or logical unit — no god blocs
- Use `Cubit` when state transitions are simple (e.g. toggle, load once); use `Bloc` when driven by multiple distinct events
- State classes use `freezed` — always extend the sealed state with `initial`, `loading`, `success`, `failure` variants
- Blocs live inside their feature folder: `features/<feature>/bloc/`
- Never emit state from outside a Bloc/Cubit — widgets dispatch events only

## Key conventions
- Mirror the types from `@godrop/shared-types` as Dart classes with `fromJson`/`toJson`
- Use `freezed` + `json_serializable` for all model classes
- All monetary display: format Kobo → Naira with `₦` symbol (e.g. `₦1,500.00`)
- Phone input: show Nigerian flag 🇳🇬, auto-prepend `+234`, validate 11-digit local format
- All API calls live in `lib/shared/api/` service classes — never call Dio from widgets
- Use `go_router` for all navigation — no `Navigator.push` in feature code
- Target: Android first (most Nigerian users), then iOS

## API
- Base URL (dev): `http://10.0.2.2:4000/api/v1` (Android emulator localhost)
- Base URL (prod): `https://api.godrop.ng/v1`
- Auth: Bearer token in `Authorization` header
- Full API contract: see `apps/backend/openapi.yaml` in the monorepo root

## Brand colors & typography (Godrop)

**Font family:** iOS system stack — use `fontFamily: '.SF UI Text'` on iOS, fall back to system sans-serif on Android. In Flutter, set `fontFamilyFallback: ['-apple-system', 'sans-serif']`.

**Color roles:**
```dart
// Text / ink roles
static const Color ink   = Color(0xFF0B1F4A);  // primary text — headings, body
static const Color slate = Color(0xFF4A5068);  // secondary — descriptions
static const Color mute  = Color(0xFF8A90A3);  // tertiary — meta, timestamps
static const Color blue  = Color(0xFF1E5FFF);  // links, active labels
static const Color orange = Color(0xFFFF6A2C); // prices, accent highlights
static const Color white  = Color(0xFFFFFFFF); // text on dark/gradient headers
```

**Usage rules:**
- Headings and body copy → `ink`
- Supporting descriptions, subtitles → `slate`
- Timestamps, metadata, hints → `mute`
- Tappable links, selected tab labels → `blue`
- Prices, promo callouts, accent badges → `orange`
- Text placed on dark or gradient backgrounds → `white`

## Nigerian UX considerations
- Support low-bandwidth conditions — lazy load images, paginate lists
- Address input: show popular areas in Lagos (Ikeja, VI, Lekki, Yaba, Surulere...)
- Delivery ETA should be shown in minutes, not exact time (traffic is unpredictable)
- Cash on delivery is a valid payment option — don't assume card-only
- Dark mode support is nice-to-have, not required at launch

## Running locally
```bash
flutter pub get
flutter run -t lib/main_customer.dart   # customer app
flutter run -t lib/main_rider.dart      # rider app
flutter build apk -t lib/main_customer.dart   # customer release APK
flutter build apk -t lib/main_rider.dart      # rider release APK
```
