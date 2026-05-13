import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/profile_models.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ProfileCubit>().load();
  }

  String _initials(String name) {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    if (parts.isNotEmpty) return parts[0][0].toUpperCase();
    return 'G';
  }

  String _fmtKobo(int kobo) {
    final naira = kobo / 100;
    if (naira >= 1000) {
      return '₦${(naira / 1000).toStringAsFixed(0)}k';
    }
    return '₦${naira.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileCubit, ProfileState>(
      builder: (context, state) {
        final profile = state is ProfileLoaded ? state.profile : null;
       // final addresses = state is ProfileLoaded ? state.addresses : <SavedAddress>[];
       // final addressCount = addresses.length;
        final walletBalance = profile != null
            ? _fmtKobo(profile.walletBalanceKobo)
            : '—';
        final name = profile != null
            ? '${profile.firstName} ${profile.lastName}'
            : '';
        final email = profile?.email ?? '';
        final initials = name.isNotEmpty ? _initials(name) : 'G';

        return Scaffold(
          backgroundColor: GodropColors.background,
          body: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Container(
                  decoration: const BoxDecoration(gradient: GodropColors.blueGradient),
                  padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 24),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Expanded(child: Text('Profile', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700))),
                          GestureDetector(
                            onTap: () => context.go('/settings'),
                            child: Icon(Icons.settings_outlined, color: Colors.white.withOpacity(0.8), size: 22),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [Color(0xFF7B4FA3), Color(0xFFC4478A)])),
                            child: Center(
                              child: state is ProfileLoading
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : Text(initials, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name.isNotEmpty ? name : 'Loading...',
                                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
                              ),
                              Text(
                                email.isNotEmpty ? email : (profile?.phone ?? ''),
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                                child: const Text('GODROP MEMBER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(color: Colors.black.withOpacity(0.19), borderRadius: BorderRadius.circular(14)),
                        child: Row(
                          children: [
                            const Expanded(child: _StatItem(value: '—', label: 'Orders')),
                            const _StatDivider(),
                            const Expanded(child: _StatItem(value: '—', label: 'Avg rating')),
                            _StatDivider(),
                            Expanded(child: _StatItem(value: walletBalance, label: 'Wallet')),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(16)),
                    child: Column(
                      children: [
                        _MenuItem(
                          icon: Icons.account_balance_wallet_rounded,
                          iconBg: const Color(0xFFE8F5EE),
                          iconColor: GodropColors.success,
                          label: 'My wallet',
                          sub: 'Balance: $walletBalance',
                          onTap: () => context.go('/wallet'),
                        ),
                        const Divider(height: 1, indent: 62),
                        _MenuItem(
                          icon: Icons.credit_card_rounded,
                          iconBg: const Color(0xFFE8EFFF),
                          iconColor: GodropColors.blue,
                          label: 'Saved cards',
                          sub: 'Manage your payment cards',
                          onTap: () => context.go('/cards'),
                        ),
                        const Divider(height: 1, indent: 62),
                        _MenuItem(
                          icon: Icons.notifications_outlined,
                          iconBg: const Color(0xFFFFF0E8),
                          iconColor: GodropColors.orange,
                          label: 'Notifications',
                          sub: '',
                          onTap: () => context.go('/notifications'),
                        ),
                        const Divider(height: 1, indent: 62),
                        _MenuItem(
                          icon: Icons.privacy_tip_outlined,
                          iconBg: GodropColors.background,
                          iconColor: GodropColors.slate,
                          label: 'Privacy policy',
                          sub: '',
                          onTap: () => context.go('/webview?url=${Uri.encodeComponent('https://naijagodrop.com/privacy-policy')}&title=Privacy+Policy'),
                        ),
                        const Divider(height: 1, indent: 62),
                        _MenuItem(
                          icon: Icons.article_outlined,
                          iconBg: GodropColors.background,
                          iconColor: GodropColors.slate,
                          label: 'Terms of service',
                          sub: '',
                          onTap: () => context.go('/webview?url=${Uri.encodeComponent('https://naijagodrop.com/terms-of-service')}&title=Terms+of+Service'),
                        ),
                        const Divider(height: 1, indent: 62),
                        _MenuItem(
                          icon: Icons.settings_outlined,
                          iconBg: GodropColors.background,
                          iconColor: GodropColors.slate,
                          label: 'Settings',
                          sub: '',
                          onTap: () => context.go('/settings'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              if (state is ProfileError)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: GodropColors.orange, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(state.message, style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
                        ),
                        TextButton(
                          onPressed: () => context.read<ProfileCubit>().load(),
                          child: const Text('Retry', style: TextStyle(color: GodropColors.blue, fontSize: 12)),
                        ),
                      ],
                    ),
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
            ],
          ),
        );
      },
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12)),
      ],
    );
  }
}

class _StatDivider extends StatelessWidget {
  const _StatDivider();

  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 28, color: Colors.white.withOpacity(0.2));
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String label;
  final String sub;
  final bool showArrow;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.iconBg, required this.iconColor, required this.label, required this.sub, this.showArrow = true, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(width: 36, height: 36, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 18, color: iconColor)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: GodropColors.ink)),
                  if (sub.isNotEmpty) Text(sub, style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                ],
              ),
            ),
            if (showArrow) const Icon(Icons.chevron_right_rounded, color: GodropColors.mute, size: 20),
          ],
        ),
      ),
    );
  }
}
