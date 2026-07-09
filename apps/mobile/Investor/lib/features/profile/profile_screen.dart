import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/services/user_prefs.dart';
import '../../shared/widgets/invest_avatar.dart';
import '../auth/bloc/auth_cubit.dart';
import 'bloc/profile_cubit.dart';

/// Screen 24 — Profile hub: avatar, name/email, edit link, menu card, log out.
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<ProfileCubit, ProfileState>(
          builder: (context, state) {
            final investor = state is ProfileLoaded ? state.investor : null;
            final name = investor?.fullName ??
                '${UserPrefs.firstName} ${UserPrefs.lastName}'.trim();
            final email = investor?.email ?? UserPrefs.email;
            final initials = name.isEmpty
                ? ''
                : name
                    .split(' ')
                    .where((p) => p.isNotEmpty)
                    .take(2)
                    .map((p) => p[0])
                    .join();
            return ListView(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
              children: [
                Center(
                  child: Column(
                    children: [
                      InvestAvatar(size: 92, ring: true, initials: initials),
                      const SizedBox(height: 16),
                      Text(
                        name.isEmpty ? 'Investor' : name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                          color: InvestColors.text,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        email,
                        style: const TextStyle(
                            fontSize: 14.5, color: InvestColors.sub),
                      ),
                      const SizedBox(height: 14),
                      GestureDetector(
                        onTap: () => context.push('/profile/details'),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.edit, size: 16, color: InvestColors.orange),
                            SizedBox(width: 6),
                            Text(
                              'Edit Profile',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: InvestColors.orange,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                Container(
                  decoration: BoxDecoration(
                    color: InvestColors.raise,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: InvestColors.line),
                  ),
                  child: Column(
                    children: [
                      _item(context, 'Profile Details', Icons.person_outline,
                          '/profile/details'),
                      _item(context, 'Withdrawal Bank', Icons.account_balance,
                          '/profile/bank'),
                      _item(context, 'Request Statement',
                          Icons.description_outlined, null, onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content:
                                  Text('Statement will be emailed to you.')),
                        );
                      }),
                      _item(context, 'KYC', Icons.badge_outlined, '/profile/kyc'),
                      _item(context, 'Settings', Icons.settings_outlined,
                          '/profile/settings'),
                      _item(context, 'FAQs & Support', Icons.help_outline,
                          '/profile/support',
                          last: true),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Center(
                  child: GestureDetector(
                    onTap: () => _confirmLogout(context),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.logout, size: 18, color: InvestColors.red),
                        SizedBox(width: 8),
                        Text(
                          'Log out',
                          style: TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w700,
                            color: InvestColors.red,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Center(
                  child: Text(
                    'GoDrop Invest v1.0.0',
                    style: TextStyle(fontSize: 11.5, color: InvestColors.mute),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _item(BuildContext context, String label, IconData icon, String? route,
      {VoidCallback? onTap, bool last = false}) {
    return GestureDetector(
      onTap: onTap ?? (route == null ? null : () => context.push(route)),
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          border: last
              ? null
              : const Border(bottom: BorderSide(color: InvestColors.line)),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: InvestColors.raise3,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: InvestColors.text),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: InvestColors.text,
                ),
              ),
            ),
            const Icon(Icons.chevron_right, size: 20, color: InvestColors.sub),
          ],
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: InvestColors.raise,
        title: const Text('Log out?',
            style: TextStyle(color: InvestColors.text, fontSize: 17)),
        content: const Text(
          'You can sign back in with your email and password anytime.',
          style: TextStyle(color: InvestColors.sub, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: InvestColors.sub)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<AuthCubit>().logout();
              if (context.mounted) context.go('/auth/sign-in');
            },
            child: const Text('Log out',
                style: TextStyle(
                    color: InvestColors.red, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
