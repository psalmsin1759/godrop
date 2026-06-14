import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/availability_toggle.dart';
import '../../shared/widgets/rider_header.dart';
import '../auth/bloc/auth_cubit.dart';
import '../notifications/bloc/notifications_cubit.dart';
import '../notifications/bloc/notifications_state.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    context.read<ProfileCubit>().loadProfile();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: BlocConsumer<ProfileCubit, ProfileState>(
        listenWhen: (previous, current) {
          if (current is ProfileError) return true;
          final prevProfile = previous is ProfileLoaded
              ? previous.profile
              : previous is ProfileSaving
                  ? previous.profile
                  : null;
          final currProfile = current is ProfileLoaded
              ? current.profile
              : current is ProfileSaving
                  ? current.profile
                  : null;
          return prevProfile != null &&
              currProfile != null &&
              currProfile.ratingCount > prevProfile.ratingCount;
        },
        listener: (ctx, state) {
          if (state is ProfileError) {
            ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
              content: Text(state.message),
              backgroundColor: GodropColors.error,
              behavior: SnackBarBehavior.floating,
            ));
            return;
          }
          final profile = state is ProfileLoaded
              ? state.profile
              : (state as ProfileSaving).profile;
          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
            content: Text('New rating received! Your rating is now ${profile.rating.toStringAsFixed(1)}★'),
            backgroundColor: GodropColors.success,
            behavior: SnackBarBehavior.floating,
          ));
        },
        builder: (ctx, state) {
          if (state is ProfileLoading) return _shimmer();
          if (state is ProfileLoaded || state is ProfileSaving) {
            final profile = state is ProfileLoaded
                ? state.profile
                : (state as ProfileSaving).profile;
            final saving = state is ProfileSaving;
            return _buildContent(ctx, profile, saving);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildContent(BuildContext ctx, RiderProfile profile, bool saving) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<ProfileCubit>().loadProfile(),
      color: GodropColors.blue,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _buildHeader(ctx, profile)),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverToBoxAdapter(
              child: Column(
                children: [
                  AnimatedEntrance(
                    child: AvailabilityToggle(
                      isAvailable: profile.isAvailable,
                      loading: saving,
                      onToggle: () =>
                          ctx.read<ProfileCubit>().toggleAvailability(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  AnimatedEntrance(
                    delay: const Duration(milliseconds: 60),
                    child: _kycCard(ctx, profile),
                  ),
                  const SizedBox(height: 12),
                  AnimatedEntrance(
                    delay: const Duration(milliseconds: 100),
                    child: _vehicleCard(profile),
                  ),
                  const SizedBox(height: 12),
                  AnimatedEntrance(
                    delay: const Duration(milliseconds: 130),
                    child: _bankCard(ctx, profile),
                  ),
                  const SizedBox(height: 12),
                  AnimatedEntrance(
                    delay: const Duration(milliseconds: 160),
                    child: _menuSection(ctx),
                  ),
                  const SizedBox(height: 24),
                  AnimatedEntrance(
                    delay: const Duration(milliseconds: 200),
                    child: _logoutButton(ctx),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext ctx, RiderProfile profile) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: GodropColors.blueGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(
          20, MediaQuery.of(ctx).padding.top + 16, 20, 28),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: GodropColors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.person_rounded,
                    color: GodropColors.white, size: 22),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Profile',
                  style: TextStyle(
                    color: GodropColors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.4,
                  ),
                ),
              ),
              BlocBuilder<NotificationsCubit, NotificationsState>(
                builder: (context, notifState) {
                  final unread = notifState is NotificationsLoaded
                      ? notifState.unreadCount
                      : 0;
                  return RiderHeaderAction(
                    icon: Icons.notifications_outlined,
                    onTap: () => ctx.push('/notifications'),
                    badge: unread > 0 ? _unreadBadge(unread) : null,
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Stack(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    padding: const EdgeInsets.all(2.5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: GodropColors.white.withValues(alpha: 0.35),
                          width: 2),
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: GodropColors.white.withValues(alpha: 0.16),
                      ),
                      child: profile.avatarUrl != null
                          ? ClipOval(
                              child: Image.network(
                                profile.avatarUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(
                                    Icons.person_rounded,
                                    color: GodropColors.white,
                                    size: 32),
                              ),
                            )
                          : const Icon(Icons.person_rounded,
                              color: GodropColors.white, size: 32),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: profile.isAvailable
                            ? GodropColors.success
                            : GodropColors.mute,
                        shape: BoxShape.circle,
                        border:
                            Border.all(color: GodropColors.blueDark, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile.fullName,
                      style: const TextStyle(
                        color: GodropColors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      profile.phone,
                      style: TextStyle(
                          color: GodropColors.white.withValues(alpha: 0.7),
                          fontSize: 13),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: GodropColors.white.withValues(alpha: 0.16),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.local_shipping_rounded,
                              size: 12, color: GodropColors.white),
                          const SizedBox(width: 4),
                          Text(
                            profile.isAvailable ? 'ONLINE' : 'OFFLINE',
                            style: const TextStyle(
                              color: GodropColors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: GodropColors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                  color: GodropColors.white.withValues(alpha: 0.16)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _StatItem(
                    value: profile.rating.toStringAsFixed(1),
                    label: 'Rating',
                  ),
                ),
                const _StatDivider(),
                Expanded(
                  child: _StatItem(
                    value: '${profile.ratingCount}',
                    label: 'Reviews',
                  ),
                ),
                const _StatDivider(),
                Expanded(
                  child: _StatItem(
                    value: profile.isAvailable ? 'Online' : 'Offline',
                    label: 'Status',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _unreadBadge(int unread) {
    return Container(
      padding: const EdgeInsets.all(3),
      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
      decoration: BoxDecoration(
        color: GodropColors.orange,
        shape: BoxShape.circle,
        border: Border.all(color: GodropColors.blueDark, width: 1.5),
      ),
      child: Center(
        child: Text(
          unread > 9 ? '9+' : '$unread',
          style: const TextStyle(
              color: GodropColors.white,
              fontSize: 9,
              fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _kycCard(BuildContext ctx, RiderProfile profile) {
    final (label, color, bg, icon) = switch (profile.kycStatus) {
      'VERIFIED' => (
          'KYC Verified',
          GodropColors.success,
          GodropColors.success.withValues(alpha: 0.1),
          Icons.verified_rounded
        ),
      'SUBMITTED' => (
          'KYC Under Review',
          GodropColors.orange,
          GodropColors.orange.withValues(alpha: 0.1),
          Icons.hourglass_empty_rounded
        ),
      'REJECTED' => (
          'KYC Rejected — Resubmit',
          GodropColors.error,
          GodropColors.error.withValues(alpha: 0.1),
          Icons.cancel_rounded
        ),
      _ => (
          'Complete KYC Verification',
          GodropColors.blue,
          GodropColors.blue.withValues(alpha: 0.08),
          Icons.assignment_rounded
        ),
    };

    final canAction =
        profile.kycStatus == 'PENDING' || profile.kycStatus == 'REJECTED';

    return GestureDetector(
      onTap: canAction ? () => ctx.push('/profile/kyc') : null,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label,
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: color)),
            ),
            if (canAction)
              Icon(Icons.chevron_right_rounded, color: color, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _vehicleCard(RiderProfile profile) {
    if (profile.vehicleType == null) {
      return const SizedBox.shrink();
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Vehicle',
              style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.directions_bike_rounded,
                  color: GodropColors.blue, size: 20),
              const SizedBox(width: 8),
              Text(
                '${profile.vehicleType} · ${profile.vehiclePlate ?? 'N/A'}',
                style: const TextStyle(
                    fontSize: 14, color: GodropColors.slate),
              ),
            ],
          ),
          if (profile.vehicleModel != null) ...[
            const SizedBox(height: 4),
            Text(
              '${profile.vehicleModel} ${profile.vehicleYear ?? ''}',
              style: const TextStyle(fontSize: 13, color: GodropColors.mute),
            ),
          ],
        ],
      ),
    );
  }

  Widget _bankCard(BuildContext ctx, RiderProfile profile) {
    return GestureDetector(
      onTap: () => ctx.push('/profile/bank'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GodropColors.border),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.account_balance_rounded,
                  color: GodropColors.blue, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bank Account',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink)),
                  Text(
                    profile.bankName != null
                        ? '${profile.bankName} · ${profile.accountNumber}'
                        : 'Add bank account for withdrawals',
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: GodropColors.mute, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _menuSection(BuildContext ctx) {
    final items = [
      (Icons.notifications_outlined, 'Notifications', '/notifications'),
    ];
    return Container(
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: items.map((item) {
          final (icon, label, route) = item;
          return GestureDetector(
            onTap: () => ctx.push(route),
            child: Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: GodropColors.slate.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, size: 18, color: GodropColors.slate),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(label,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: GodropColors.ink)),
                  ),
                  const Icon(Icons.chevron_right_rounded,
                      color: GodropColors.mute, size: 18),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _logoutButton(BuildContext ctx) {
    return GestureDetector(
      onTap: () => _confirmLogout(ctx),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: GodropColors.error.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GodropColors.error.withValues(alpha: 0.2)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.logout_rounded, color: GodropColors.error, size: 18),
            SizedBox(width: 8),
            Text('Log Out',
                style: TextStyle(
                    color: GodropColors.error,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext ctx) {
    showDialog(
      context: ctx,
      builder: (dCtx) => AlertDialog(
        title: const Text('Log Out?'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dCtx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dCtx);
              ctx.read<AuthCubit>().logout().then((_) {
                if (ctx.mounted) ctx.go('/auth/phone');
              });
            },
            child: const Text('Log Out',
                style: TextStyle(color: GodropColors.error)),
          ),
        ],
      ),
    );
  }

  Widget _shimmer() {
    return Shimmer.fromColors(
      baseColor: GodropColors.border,
      highlightColor: GodropColors.white,
      child: ListView(
        children: [
          Container(
              height: 240,
              color: GodropColors.white,
              margin: const EdgeInsets.only(bottom: 16)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: List.generate(
                4,
                (_) => Container(
                  height: 60,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                      color: GodropColors.white,
                      borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Stat widgets ──────────────────────────────────────────────────────────────

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                color: GodropColors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700)),
        Text(label,
            style: TextStyle(
                color: GodropColors.white.withValues(alpha: 0.7),
                fontSize: 12)),
      ],
    );
  }
}

class _StatDivider extends StatelessWidget {
  const _StatDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 1,
        height: 28,
        color: GodropColors.white.withValues(alpha: 0.2));
  }
}
