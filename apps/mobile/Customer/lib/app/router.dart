import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/splash/splash_screen.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/auth/phone_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/create_profile_screen.dart';
import '../features/auth/location_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/home/home_screen.dart';
import '../features/home/all_services_screen.dart';
import '../features/home/search_screen.dart';
import '../features/orders/all_active_orders_screen.dart';
import '../features/parcel/parcel_addresses_screen.dart';
import '../features/parcel/parcel_vehicle_screen.dart';
import '../features/parcel/finding_rider_screen.dart';
import '../features/parcel/models/parcel_location.dart';
import '../features/truck/truck_booking_screen.dart';
import '../features/truck/truck_confirmation_screen.dart';
import '../features/truck/models/truck_booking_data.dart';
import '../features/food/cart_checkout_screen.dart';
import '../features/food/models/restaurant_data.dart';
import '../features/partners/partners_screen.dart';
import '../features/partners/partner_menu_screen.dart';
import '../features/partners/models/partner_item.dart';
import '../features/grocery/grocery_hub_screen.dart';
import '../features/tracking/live_tracking_screen.dart';
import '../features/orders/orders_screen.dart';
import '../features/orders/models/active_order.dart';
import '../features/orders/order_detail_screen.dart';
import '../features/orders/delivered_rate_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/wallet_screen.dart';
import '../features/profile/settings_screen.dart';
import '../features/profile/notifications_screen.dart';
import '../features/webview/webview_screen.dart';
import '../features/profile/saved_cards_screen.dart';
import '../shared/widgets/main_shell.dart';

// ── Transition helpers ────────────────────────────────────────────────────────

/// Slide from right — used for forward navigation flows.
CustomTransitionPage<void> _slide(GoRouterState state, Widget child) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 320),
    reverseTransitionDuration: const Duration(milliseconds: 280),
    transitionsBuilder: (_, animation, __, child) {
      final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
      return SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1.0, 0),
          end: Offset.zero,
        ).animate(curved),
        child: child,
      );
    },
  );
}

/// Fade + slight slide up — used for confirmation / modal-style screens.
CustomTransitionPage<void> _fadeUp(GoRouterState state, Widget child) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 340),
    reverseTransitionDuration: const Duration(milliseconds: 260),
    transitionsBuilder: (_, animation, __, child) {
      final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
      return FadeTransition(
        opacity: animation,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.06),
            end: Offset.zero,
          ).animate(curved),
          child: child,
        ),
      );
    },
  );
}

/// Fade only — used for same-level transitions (auth flow, onboarding).
CustomTransitionPage<void> _fade(GoRouterState state, Widget child) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 280),
    reverseTransitionDuration: const Duration(milliseconds: 220),
    transitionsBuilder: (_, animation, __, child) =>
        FadeTransition(opacity: animation, child: child),
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

final GoRouter appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      pageBuilder: (_, state) => _fade(state, const SplashScreen()),
    ),
    GoRoute(
      path: '/onboarding',
      pageBuilder: (_, state) => _fade(state, const OnboardingScreen()),
    ),
    GoRoute(
      path: '/auth/phone',
      pageBuilder: (_, state) => _fadeUp(state, const PhoneScreen()),
    ),
    GoRoute(
      path: '/auth/otp',
      pageBuilder: (_, state) {
        final phone = state.uri.queryParameters['phone'] ?? '+234 803 414 2290';
        return _slide(state, OtpScreen(phone: phone));
      },
    ),
    GoRoute(
      path: '/auth/profile',
      pageBuilder: (_, state) => _slide(state, const CreateProfileScreen()),
    ),
    GoRoute(
      path: '/auth/location',
      pageBuilder: (_, state) => _slide(state, const LocationScreen()),
    ),
    GoRoute(
      path: '/auth/login',
      pageBuilder: (_, state) => _fadeUp(state, const LoginScreen()),
    ),
    GoRoute(
      path: '/auth/forgot-password',
      pageBuilder: (_, state) => _slide(state, const ForgotPasswordScreen()),
    ),
    GoRoute(
      path: '/parcel/addresses',
      pageBuilder: (_, state) => _slide(state, const ParcelAddressesScreen()),
    ),
    GoRoute(
      path: '/parcel/vehicle',
      pageBuilder: (_, state) => _slide(
        state,
        ParcelVehicleScreen(routeData: state.extra as ParcelRouteData?),
      ),
    ),
    GoRoute(
      path: '/parcel/finding',
      pageBuilder: (_, state) => _fadeUp(
        state,
        FindingRiderScreen(routeData: state.extra as ParcelRouteData?),
      ),
    ),
    GoRoute(
      path: '/truck',
      pageBuilder: (_, state) => _slide(state, const TruckBookingScreen()),
    ),
    GoRoute(
      path: '/truck/confirmation',
      pageBuilder: (_, state) => _fadeUp(
        state,
        TruckConfirmationScreen(booking: state.extra as TruckBookingData),
      ),
    ),
    GoRoute(
      path: '/food/restaurants',
      pageBuilder: (_, state) => _slide(
        state,
        const PartnersScreen(partnerType: PartnerType.restaurant),
      ),
    ),
    GoRoute(
      path: '/food/restaurant',
      pageBuilder: (_, state) {
        final extra = state.extra;
        final PartnerItem? partner;
        final String? deliveryAddress;
        if (extra is Map<String, dynamic>) {
          partner = extra['partner'] as PartnerItem?;
          deliveryAddress = extra['deliveryAddress'] as String?;
        } else {
          partner = extra as PartnerItem?;
          deliveryAddress = null;
        }
        if (partner == null) return _slide(state, const _MissingPartnerScreen());
        return _slide(state, PartnerMenuScreen(partner: partner, deliveryAddress: deliveryAddress));
      },
    ),
    GoRoute(
      path: '/partner/menu',
      pageBuilder: (_, state) {
        final extra = state.extra;
        final PartnerItem? partner;
        final String? deliveryAddress;
        if (extra is Map<String, dynamic>) {
          partner = extra['partner'] as PartnerItem?;
          deliveryAddress = extra['deliveryAddress'] as String?;
        } else {
          partner = extra as PartnerItem?;
          deliveryAddress = null;
        }
        if (partner == null) return _slide(state, const _MissingPartnerScreen());
        return _slide(state, PartnerMenuScreen(partner: partner, deliveryAddress: deliveryAddress));
      },
    ),
    GoRoute(
      path: '/food/cart',
      pageBuilder: (_, state) {
        final extra = state.extra;
        String partnerId = '';
        if (extra is Map<String, dynamic>) {
          partnerId = extra['partnerId'] as String? ?? '';
        } else if (extra is String) {
          partnerId = extra;
        }
        return _fadeUp(state, CartCheckoutScreen(partnerId: partnerId));
      },
    ),
    GoRoute(
      path: '/grocery/stores',
      pageBuilder: (_, state) => _slide(
        state,
        const PartnersScreen(partnerType: PartnerType.grocery),
      ),
    ),
    GoRoute(
      path: '/retail/stores',
      pageBuilder: (_, state) => _slide(
        state,
        const PartnersScreen(partnerType: PartnerType.retail),
      ),
    ),
    GoRoute(
      path: '/pharmacy/stores',
      pageBuilder: (_, state) => _slide(
        state,
        const PartnersScreen(partnerType: PartnerType.pharmacy),
      ),
    ),
    GoRoute(
      path: '/grocery',
      pageBuilder: (_, state) => _slide(state, const GroceryHubScreen()),
    ),
    GoRoute(
      path: '/tracking',
      pageBuilder: (_, state) => _fadeUp(
        state,
        LiveTrackingScreen(order: state.extra as ActiveOrderData?),
      ),
    ),
    GoRoute(
      path: '/orders/:id',
      pageBuilder: (_, state) => _fadeUp(
        state,
        OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),
    ),
    GoRoute(
      path: '/orders/delivered',
      pageBuilder: (_, state) => _fadeUp(state, const DeliveredRateScreen()),
    ),
    GoRoute(
      path: '/services',
      pageBuilder: (_, state) => _slide(state, const AllServicesScreen()),
    ),
    GoRoute(
      path: '/search',
      pageBuilder: (_, state) => _slide(state, const SearchScreen()),
    ),
    GoRoute(
      path: '/active-orders',
      pageBuilder: (_, state) => _slide(state, const AllActiveOrdersScreen()),
    ),
    GoRoute(
      path: '/notifications',
      pageBuilder: (_, state) => _slide(state, const NotificationsScreen()),
    ),
    GoRoute(
      path: '/settings',
      pageBuilder: (_, state) => _slide(state, const SettingsScreen()),
    ),
    GoRoute(
      path: '/webview',
      pageBuilder: (_, state) {
        final url = state.uri.queryParameters['url'] ?? '';
        final title = state.uri.queryParameters['title'] ?? '';
        return _slide(state, WebviewScreen(url: url, title: title));
      },
    ),
    GoRoute(
      path: '/cards',
      pageBuilder: (_, state) => _slide(state, const SavedCardsScreen()),
    ),
    StatefulShellRoute.indexedStack(
      builder: (_, __, shell) => MainShell(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ]),
      ],
    ),
  ],
);

class _MissingPartnerScreen extends StatelessWidget {
  const _MissingPartnerScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Partner not found',
                style: TextStyle(fontSize: 16, color: Color(0xFF4A5068))),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go home'),
            ),
          ],
        ),
      ),
    );
  }
}
