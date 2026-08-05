import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../shared/services/token_storage.dart';
import '../shared/services/rider_prefs.dart';
import '../features/auth/phone_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/auth/create_password_screen.dart';
import '../features/jobs/jobs_screen.dart';
import '../features/jobs/job_detail_screen.dart';
import '../features/active/active_delivery_screen.dart';
import '../features/active/active_map_screen.dart';
import '../features/earnings/earnings_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/kyc_screen.dart';
import '../features/profile/bank_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../shared/widgets/rider_shell.dart';

final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) async {
    if (state.matchedLocation != '/') return null;
    final hasTokens = await TokenStorage.hasTokens();
    if (hasTokens && RiderPrefs.isOnboarded) return '/jobs';
    return '/auth/login';
  },
  routes: [
    GoRoute(
      path: '/',
      pageBuilder: (ctx, state) =>
          _fade(state, const ColoredBox(color: Color(0xFF1A3CCC))),
    ),

    // Auth flow
    GoRoute(
      path: '/auth/login',
      pageBuilder: (ctx, state) => _slide(state, const LoginScreen()),
    ),
    GoRoute(
      path: '/auth/forgot-password',
      pageBuilder: (ctx, state) =>
          _slide(state, const ForgotPasswordScreen()),
    ),
    GoRoute(
      path: '/auth/create-password',
      pageBuilder: (ctx, state) {
        final riderId = state.extra as String? ?? '';
        return _slide(state, CreatePasswordScreen(riderId: riderId));
      },
    ),
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
              routes: [
                GoRoute(
                  path: 'map',
                  pageBuilder: (ctx, state) => _slide(
                      state,
                      ActiveMapScreen(
                          focusDropoffId: state.extra as String?)),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/earnings',
              pageBuilder: (ctx, state) => _fade(state, const EarningsScreen()),
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
