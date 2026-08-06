import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../shared/services/token_storage.dart';
import '../features/profile/bloc/session_cubit.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/orders/orders_screen.dart';
import '../features/orders/order_detail_screen.dart';
import '../features/catalog/catalog_screen.dart';
import '../features/catalog/product_form_screen.dart';
import '../features/catalog/category_form_screen.dart';
import '../features/wallet/wallet_screen.dart';
import '../features/wallet/bank_account_screen.dart';
import '../features/team/team_screen.dart';
import '../features/settings/store_settings_screen.dart';
import '../features/settings/opening_hours_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/edit_profile_screen.dart';
import '../features/profile/change_password_screen.dart';
import '../features/profile/notifications_screen.dart';
import '../features/profile/audit_logs_screen.dart';
import '../features/disputes/report_issue_screen.dart';
import '../features/disputes/my_disputes_screen.dart';
import '../features/disputes/dispute_detail_screen.dart';
import '../shared/models/catalog_models.dart';
import '../shared/services/user_prefs.dart';
import '../shared/widgets/main_shell.dart';

/// Route guard for MANAGER+ screens. Uses the locally cached role so it
/// works before the profile refresh completes; the API enforces the same
/// rules server-side.
String? _managerOnly(BuildContext context, GoRouterState state) =>
    UserPrefs.adminRole == 'STAFF' ? '/dashboard' : null;

String? _ownerOnly(BuildContext context, GoRouterState state) =>
    UserPrefs.adminRole == 'OWNER' ? null : '/dashboard';

// ── Transition helpers ────────────────────────────────────────────────────────

/// Slide from right — used for forward navigation flows.
CustomTransitionPage<void> _slide(GoRouterState state, Widget child) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 320),
    reverseTransitionDuration: const Duration(milliseconds: 280),
    transitionsBuilder: (_, animation, __, child) {
      final curved =
          CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
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
      final curved =
          CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
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

/// Fade only — used for same-level transitions (auth flow, splash).
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

final rootNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) async {
    if (state.matchedLocation != '/') return null;
    final hasToken = await TokenStorage.hasToken();
    if (!context.mounted) return null;
    if (hasToken) {
      context.read<SessionCubit>().load();
      return '/dashboard';
    }
    return '/auth/login';
  },
  routes: [
    GoRoute(
      path: '/',
      pageBuilder: (_, state) =>
          _fade(state, const ColoredBox(color: Color(0xFF1A3CCC))),
    ),
    GoRoute(
      path: '/auth/login',
      pageBuilder: (_, state) => _fade(state, const LoginScreen()),
    ),
    GoRoute(
      path: '/auth/forgot-password',
      pageBuilder: (_, state) => _slide(state, const ForgotPasswordScreen()),
    ),
    GoRoute(
      path: '/auth/onboard',
      pageBuilder: (_, state) =>
          _fadeUp(state, const VendorOnboardingScreen()),
    ),
    GoRoute(
      path: '/orders/:id',
      pageBuilder: (_, state) => _fadeUp(
        state,
        OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),
    ),
    GoRoute(
      path: '/orders/:id/report-issue',
      pageBuilder: (_, state) => _slide(
        state,
        ReportIssueScreen(
          orderId: state.pathParameters['id']!,
          trackingCode: (state.extra as String?) ?? '',
        ),
      ),
    ),
    GoRoute(
      path: '/disputes',
      pageBuilder: (_, state) => _slide(state, const MyDisputesScreen()),
    ),
    GoRoute(
      path: '/disputes/:id',
      pageBuilder: (_, state) => _slide(
        state,
        DisputeDetailScreen(disputeId: state.pathParameters['id']!),
      ),
    ),
    GoRoute(
      path: '/catalog/product/new',
      pageBuilder: (_, state) => _fadeUp(state, const ProductFormScreen()),
    ),
    GoRoute(
      path: '/catalog/product/:id',
      pageBuilder: (_, state) => _slide(
        state,
        ProductFormScreen(product: state.extra as Product?),
      ),
    ),
    GoRoute(
      path: '/catalog/category/new',
      pageBuilder: (_, state) => _fadeUp(state, const CategoryFormScreen()),
    ),
    GoRoute(
      path: '/catalog/category/:id',
      pageBuilder: (_, state) => _slide(
        state,
        CategoryFormScreen(category: state.extra as ProductCategory?),
      ),
    ),
    GoRoute(
      path: '/wallet/bank-account',
      redirect: _ownerOnly,
      pageBuilder: (_, state) => _slide(state, const BankAccountScreen()),
    ),
    GoRoute(
      path: '/team',
      redirect: _managerOnly,
      pageBuilder: (_, state) => _slide(state, const TeamScreen()),
    ),
    GoRoute(
      path: '/settings/store',
      redirect: _managerOnly,
      pageBuilder: (_, state) => _slide(state, const StoreSettingsScreen()),
    ),
    GoRoute(
      path: '/settings/hours',
      redirect: _managerOnly,
      pageBuilder: (_, state) => _slide(
        state,
        OpeningHoursScreen(
            initialHours: state.extra as Map<String, dynamic>?),
      ),
    ),
    GoRoute(
      path: '/notifications',
      pageBuilder: (_, state) => _slide(state, const NotificationsScreen()),
    ),
    GoRoute(
      path: '/audit-logs',
      redirect: _managerOnly,
      pageBuilder: (_, state) => _slide(state, const AuditLogsScreen()),
    ),
    GoRoute(
      path: '/profile/edit',
      pageBuilder: (_, state) => _slide(state, const EditProfileScreen()),
    ),
    GoRoute(
      path: '/profile/change-password',
      pageBuilder: (_, state) => _slide(state, const ChangePasswordScreen()),
    ),
    StatefulShellRoute.indexedStack(
      builder: (_, __, shell) => MainShell(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/catalog', builder: (_, __) => const CatalogScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/wallet',
            redirect: _managerOnly,
            builder: (_, __) => const WalletScreen(),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/more', builder: (_, __) => const ProfileScreen()),
        ]),
      ],
    ),
  ],
);
