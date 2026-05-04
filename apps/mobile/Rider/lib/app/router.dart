import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/splash/splash_screen.dart';
import '../features/auth/phone_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/jobs/jobs_screen.dart';
import '../features/jobs/job_detail_screen.dart';
import '../features/active/active_delivery_screen.dart';
import '../features/history/history_screen.dart';
import '../features/earnings/earnings_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/kyc_screen.dart';
import '../features/profile/bank_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../shared/widgets/rider_shell.dart';

final router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      pageBuilder: (ctx, state) => _fade(state, const SplashScreen()),
    ),

    // Auth flow
    GoRoute(
      path: '/auth/phone',
      pageBuilder: (ctx, state) => _slide(state, const PhoneScreen()),
    ),
    GoRoute(
      path: '/auth/otp',
      pageBuilder: (ctx, state) {
        final phone = state.extra as String? ?? '';
        return _slide(state, OtpScreen(phone: phone));
      },
    ),

    // Main shell — 4 tabs
    StatefulShellRoute.indexedStack(
      builder: (ctx, state, shell) => RiderShell(navigationShell: shell),
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/jobs',
              pageBuilder: (ctx, state) => _fade(state, const JobsScreen()),
              routes: [
                GoRoute(
                  path: ':id',
                  pageBuilder: (ctx, state) => _slide(
                    state,
                    JobDetailScreen(orderId: state.pathParameters['id']!),
                  ),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/active',
              pageBuilder: (ctx, state) =>
                  _fade(state, const ActiveDeliveryScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/earnings',
              pageBuilder: (ctx, state) => _fade(state, const EarningsScreen()),
              routes: [
                GoRoute(
                  path: 'history',
                  pageBuilder: (ctx, state) =>
                      _slide(state, const HistoryScreen()),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              pageBuilder: (ctx, state) =>
                  _fade(state, const ProfileScreen()),
              routes: [
                GoRoute(
                  path: 'kyc',
                  pageBuilder: (ctx, state) => _slide(state, const KycScreen()),
                ),
                GoRoute(
                  path: 'bank',
                  pageBuilder: (ctx, state) =>
                      _slide(state, const BankScreen()),
                ),
              ],
            ),
          ],
        ),
      ],
    ),

    // Standalone routes (outside shell)
    GoRoute(
      path: '/notifications',
      pageBuilder: (ctx, state) =>
          _slide(state, const NotificationsScreen()),
    ),
  ],
);

CustomTransitionPage<void> _slide(GoRouterState state, Widget child) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (_, animation, __, child) => SlideTransition(
      position: Tween(
        begin: const Offset(1, 0),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
      child: child,
    ),
  );
}

CustomTransitionPage<void> _fade(GoRouterState state, Widget child) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (_, animation, __, child) =>
        FadeTransition(opacity: animation, child: child),
  );
}
