---
name: Godrop Customer App — Project State
description: Architecture decisions, implemented features, key file locations for the Customer Flutter app
type: project
---

## Tech Stack
Flutter + Dart, flutter_bloc (Cubit/Bloc), go_router, Hive (local storage), Google Maps/Places API.

## State Management
- `OrderCubit` — manages active orders (parcel/truck/food), persisted in Hive box 'orders'
- `CartCubit` — manages food cart (in-memory, no Hive persistence)
- `UserPrefs` — Hive box 'user_prefs', stores name/email/onboarded flag

## Key Decisions
- Prices are stored in **kobo** (integer). Display divides by 100. Format: `₦{value/100}`.
- Food orders use `ActiveOrderData` with `orderType = 'food'`, optional `restaurantName`, `confirmationCode`, `foodSummary` fields.
- `CartCubit` is provided at app level in `main_customer.dart` via `MultiBlocProvider`.
- `UserPrefs.init()` is called in `main()` before `runApp()`.
- Splash screen checks `UserPrefs.isOnboarded` — goes to `/home` if true, else `/onboarding`.

## Restaurants (7 Nigerian restaurants in `restaurant_data.dart`)
1. The Place Restaurant (the-place) — Nigerian/Continental, Lekki, free delivery
2. Chicken Republic (chicken-republic) — Fast Food, VI, ₦350 delivery
3. Bukka Hut (bukka-hut) — Nigerian Buffet, Ikeja, ₦500 delivery
4. Suya Spot Lagos (suya-spot) — Grills/BBQ, Yaba, ₦400 delivery
5. Shawarma Planet (shawarma-planet) — Middle Eastern, Lekki, ₦300 delivery
6. Mr. Biggs (mr-biggs) — Fast Food, VI, ₦250 delivery
7. Yellow Chilli (yellow-chilli) — Fine Dining, Ikoyi, ₦600 delivery

## Cart Flow
RestaurantsScreen → RestaurantMenuScreen (CartCubit.addItem) → CartCheckoutScreen → place order → OrderCubit.placeOrder → home

**Why:** Avoid complex navigation state; CartCubit lives at app level so all screens share it.

## Delivery Confirmation Code
6-digit random number generated at order placement time. Stored in `ActiveOrderData.confirmationCode`. Shown in order confirmation sheet and orders screen.
