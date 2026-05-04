import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../auth/bloc/auth_cubit.dart';
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
      body: SafeArea(
        child: BlocConsumer<ProfileCubit, ProfileState>(
          listener: (ctx, state) {
            if (state is ProfileError) {
              ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                content: Text(state.message),
                backgroundColor: GodropColors.error,
                behavior: SnackBarBehavior.floating,
              ));
            }
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
      ),
    );
  }

  Widget _buildContent(BuildContext ctx, RiderProfile profile, bool saving) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<ProfileCubit>().loadProfile(),
      color: GodropColors.blue,
      child: ListView(
        children: [
          AnimatedEntrance(
            child: _buildHeader(ctx, profile, saving),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
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
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext ctx, RiderProfile profile, bool saving) {
    return Container(
      color: GodropColors.white,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
      child: Column(
        children: [
          Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 34,
                    backgroundColor: GodropColors.blue.withOpacity(0.1),
                    backgroundImage: profile.avatarUrl != null
                        ? NetworkImage(profile.avatarUrl!)
                        : null,
                    child: profile.avatarUrl == null
                        ? const Icon(Icons.person_rounded,
                            color: GodropColors.blue, size: 34)
                        : null,
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
                        border: Border.all(
                            color: GodropColors.white, width: 2),
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
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink,
                      ),
                    ),
                    Text(
                      profile.phone,
                      style: const TextStyle(
                          fontSize: 13, color: GodropColors.mute),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            color: GodropColors.orange, size: 14),
                        const SizedBox(width: 3),
                        Text(
                          profile.rating.toStringAsFixed(1),
                          style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: GodropColors.ink),
                        ),
                        Text(' (${profile.ratingCount})',
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.mute)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _AvailabilityToggle(
            isAvailable: profile.isAvailable,
            loading: saving,
            onToggle: () => ctx.read<ProfileCubit>().toggleAvailability(),
          ),
        ],
      ),
    );
  }

  Widget _kycCard(BuildContext ctx, RiderProfile profile) {
    final (label, color, bg, icon) = switch (profile.kycStatus) {
      'VERIFIED' => (
          'KYC Verified',
          GodropColors.success,
          GodropColors.success.withOpacity(0.1),
          Icons.verified_rounded
        ),
      'SUBMITTED' => (
          'KYC Under Review',
          GodropColors.orange,
          GodropColors.orange.withOpacity(0.1),
          Icons.hourglass_empty_rounded
        ),
      'REJECTED' => (
          'KYC Rejected — Resubmit',
          GodropColors.error,
          GodropColors.error.withOpacity(0.1),
          Icons.cancel_rounded
        ),
      _ => (
          'Complete KYC Verification',
          GodropColors.blue,
          GodropColors.blue.withOpacity(0.08),
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
          border: Border.all(color: color.withOpacity(0.3)),
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
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: GodropColors.blue.withOpacity(0.08),
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
      ),
      child: Column(
        children: items.map((item) {
          final (icon, label, route) = item;
          return GestureDetector(
            onTap: () => ctx.push(route),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Icon(icon, color: GodropColors.slate, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(label,
                        style: const TextStyle(
                            fontSize: 14, color: GodropColors.ink)),
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
          color: GodropColors.error.withOpacity(0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: GodropColors.error.withOpacity(0.2)),
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
              height: 140,
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

class _AvailabilityToggle extends StatelessWidget {
  final bool isAvailable;
  final bool loading;
  final VoidCallback onToggle;

  const _AvailabilityToggle({
    required this.isAvailable,
    required this.loading,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onToggle,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isAvailable
              ? GodropColors.success.withOpacity(0.1)
              : GodropColors.background,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isAvailable
                ? GodropColors.success.withOpacity(0.4)
                : GodropColors.border,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isAvailable
                  ? Icons.radio_button_on_rounded
                  : Icons.radio_button_off_rounded,
              color: isAvailable ? GodropColors.success : GodropColors.mute,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isAvailable ? 'You are Online — receiving orders' : 'You are Offline — go online to receive orders',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color:
                      isAvailable ? GodropColors.success : GodropColors.mute,
                ),
              ),
            ),
            if (loading)
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: GodropColors.blue),
              )
            else
              Switch(
                value: isAvailable,
                onChanged: (_) => onToggle(),
                activeTrackColor: GodropColors.success,
              ),
          ],
        ),
      ),
    );
  }
}
