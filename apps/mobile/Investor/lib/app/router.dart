import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/assets/asset_detail_screen.dart';
import '../features/assets/catalog_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/sign_in_screen.dart';
import '../features/auth/sign_up_screen.dart';
import '../features/home/home_screen.dart';
import '../features/invest/amount_screen.dart';
import '../features/invest/payment_screen.dart';
import '../features/invest/plan_select_screen.dart';
import '../features/invest/review_screen.dart';
import '../features/invest/success_screen.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/portfolio/investment_detail_screen.dart';
import '../features/portfolio/portfolio_screen.dart';
import '../features/profile/bank_screen.dart';
import '../features/profile/kyc_screen.dart';
import '../features/profile/notifications_screen.dart';
import '../features/profile/profile_details_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/settings_screen.dart';
import '../features/profile/support_screen.dart';
import '../features/safe/safe_screen.dart';
import '../features/splash/splash_screen.dart';
import '../features/transactions/transactions_screen.dart';
import '../features/wallet/fund_screen.dart';
import '../features/wallet/withdraw_screen.dart';
import '../shared/models/invest_models.dart';
import '../shared/widgets/main_shell.dart';

// ── Transition helpers (same feel as the Vendor app) ─────────────────────────

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
        position: Tween<Offset>(begin: const Offset(1.0, 0), end: Offset.zero)
            .animate(curved),
        child: child,
      );
    },
  );
}

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
          position: Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero)
              .animate(curved),
          child: child,
        ),
      );
    },
  );
}

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
      path: '/auth/sign-up',
      pageBuilder: (_, state) => _fade(state, const SignUpScreen()),
    ),
    GoRoute(
      path: '/auth/otp',
      pageBuilder: (_, state) =>
          _slide(state, OtpScreen(phone: state.extra as String? ?? '')),
    ),
    GoRoute(
      path: '/auth/sign-in',
      pageBuilder: (_, state) => _fade(state, const SignInScreen()),
    ),
    GoRoute(
      path: '/assets',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(
          state, CatalogScreen(initialClass: state.extra as String?)),
    ),
    GoRoute(
      path: '/assets/:id',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _fadeUp(
          state, AssetDetailScreen(asset: state.extra as InvestmentAsset)),
    ),
    GoRoute(
      path: '/invest/plans',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(
          state, PlanSelectScreen(asset: state.extra as InvestmentAsset)),
    ),
    GoRoute(
      path: '/invest/amount',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const AmountScreen()),
    ),
    GoRoute(
      path: '/invest/review',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const ReviewScreen()),
    ),
    GoRoute(
      path: '/invest/payment',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const PaymentScreen()),
    ),
    GoRoute(
      path: '/invest/success',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _fadeUp(state, const InvestSuccessScreen()),
    ),
    GoRoute(
      path: '/portfolio/:id',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(
          state,
          InvestmentDetailScreen(investmentId: state.pathParameters['id']!)),
    ),
    GoRoute(
      path: '/wallet/fund',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _fadeUp(state, const FundScreen()),
    ),
    GoRoute(
      path: '/wallet/withdraw',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _fadeUp(state, const WithdrawScreen()),
    ),
    GoRoute(
      path: '/notifications',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const NotificationsScreen()),
    ),
    GoRoute(
      path: '/profile/details',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const ProfileDetailsScreen()),
    ),
    GoRoute(
      path: '/profile/bank',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const BankScreen()),
    ),
    GoRoute(
      path: '/profile/kyc',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const KycScreen()),
    ),
    GoRoute(
      path: '/profile/settings',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const SettingsScreen()),
    ),
    GoRoute(
      path: '/profile/support',
      parentNavigatorKey: rootNavigatorKey,
      pageBuilder: (_, state) => _slide(state, const SupportScreen()),
    ),
    StatefulShellRoute.indexedStack(
      builder: (_, __, shell) => MainShell(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/safe', builder: (_, __) => const SafeScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/portfolio', builder: (_, __) => const PortfolioScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
              path: '/transactions',
              builder: (_, __) => const TransactionsScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ]),
      ],
    ),
  ],
);
