import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/services/user_prefs.dart';
import '../auth/bloc/auth_cubit.dart';
import 'bloc/session_cubit.dart';

/// The "More" tab — account, store management shortcuts, and sign out.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionCubit>();
    final admin = session.state;
    final name = admin?.fullName ?? UserPrefs.adminName;
    final email = admin?.email ?? UserPrefs.adminEmail;
    final vendorName = admin?.vendor?.name ?? UserPrefs.vendorName;
    final role = session.role;

    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: const Text('More'),
        automaticallyImplyLeading: false,
        backgroundColor: GodropColors.background,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: GodropColors.card,
              borderRadius: BorderRadius.circular(20),
              boxShadow: GodropColors.softShadow,
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: GodropColors.blue.withValues(alpha: 0.10),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.blue),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name,
                          style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink)),
                      Text(email,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontSize: 12, color: GodropColors.mute)),
                      const SizedBox(height: 4),
                      Text(
                        '$vendorName · ${_roleLabel(role)}',
                        style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: GodropColors.blue),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _MenuGroup(items: [
            _MenuItem(
              icon: Icons.person_outline_rounded,
              label: 'Edit profile',
              onTap: () => context.push('/profile/edit'),
            ),
            _MenuItem(
              icon: Icons.lock_outline_rounded,
              label: 'Change password',
              onTap: () => context.push('/profile/change-password'),
            ),
            _MenuItem(
              icon: Icons.notifications_none_rounded,
              label: 'Notifications',
              onTap: () => context.push('/notifications'),
            ),
          ]),
          const SizedBox(height: 16),
          _MenuGroup(items: [
            if (session.isManagerOrAbove)
              _MenuItem(
                icon: Icons.storefront_outlined,
                label: 'Store settings',
                onTap: () => context.push('/settings/store'),
              ),
            if (session.isManagerOrAbove)
              _MenuItem(
                icon: Icons.group_outlined,
                label: 'Team',
                onTap: () => context.push('/team'),
              ),
            if (session.isManagerOrAbove)
              _MenuItem(
                icon: Icons.history_rounded,
                label: 'Activity log',
                onTap: () => context.push('/audit-logs'),
              ),
          ]),
          const SizedBox(height: 16),
          _MenuGroup(items: [
            _MenuItem(
              icon: Icons.logout_rounded,
              label: 'Sign out',
              destructive: true,
              onTap: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (dCtx) => AlertDialog(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20)),
                    title: const Text('Sign out?'),
                    content:
                        const Text("You'll need your password to sign back in."),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(dCtx, false),
                          child: const Text('Stay')),
                      TextButton(
                        onPressed: () => Navigator.pop(dCtx, true),
                        child: const Text('Sign out',
                            style: TextStyle(color: GodropColors.error)),
                      ),
                    ],
                  ),
                );
                if (confirmed == true && context.mounted) {
                  context.read<SessionCubit>().clear();
                  await context.read<AuthCubit>().logout();
                  if (context.mounted) context.go('/auth/login');
                }
              },
            ),
          ]),
        ],
      ),
    );
  }

  String _roleLabel(String role) => switch (role) {
        'OWNER' => 'Owner',
        'MANAGER' => 'Manager',
        _ => 'Staff',
      };
}

class _MenuItem {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool destructive;
  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.destructive = false,
  });
}

class _MenuGroup extends StatelessWidget {
  final List<_MenuItem> items;
  const _MenuGroup({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Container(
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0)
              const Divider(height: 1, indent: 56),
            InkWell(
              onTap: items[i].onTap,
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Icon(items[i].icon,
                        size: 21,
                        color: items[i].destructive
                            ? GodropColors.error
                            : GodropColors.slate),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(items[i].label,
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: items[i].destructive
                                  ? GodropColors.error
                                  : GodropColors.ink)),
                    ),
                    if (!items[i].destructive)
                      const Icon(Icons.chevron_right_rounded,
                          size: 20, color: GodropColors.mute),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
