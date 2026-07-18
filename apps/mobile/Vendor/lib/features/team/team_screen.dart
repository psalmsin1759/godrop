import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/team_models.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../../shared/widgets/skeleton.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/team_cubit.dart';
import 'bloc/team_state.dart';

class TeamScreen extends StatelessWidget {
  const TeamScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => TeamCubit()..load(),
      child: const _TeamView(),
    );
  }
}

class _TeamView extends StatelessWidget {
  const _TeamView();

  void _toast(BuildContext ctx, String msg, {bool error = true}) {
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red.shade700 : GodropColors.success,
      behavior: SnackBarBehavior.floating,
    ));
  }

  Future<void> _inviteSheet(BuildContext ctx) async {
    final firstCtrl = TextEditingController();
    final lastCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    var role = 'STAFF';
    final cubit = ctx.read<TeamCubit>();

    final submitted = await showModalBottomSheet<bool>(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: GodropColors.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
              20, 20, 20, MediaQuery.of(sheetCtx).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Invite team member',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
              const SizedBox(height: 4),
              const Text(
                'They get an email with a temporary password to sign in.',
                style: TextStyle(fontSize: 13, color: GodropColors.slate),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                      child: GodropField(
                          controller: firstCtrl, hint: 'First name')),
                  const SizedBox(width: 10),
                  Expanded(
                      child: GodropField(
                          controller: lastCtrl, hint: 'Last name')),
                ],
              ),
              const SizedBox(height: 12),
              GodropField(
                controller: emailCtrl,
                hint: 'Email address',
                keyboardType: TextInputType.emailAddress,
                icon: Icons.mail_outline_rounded,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  for (final r in const ['STAFF', 'MANAGER']) ...[
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setSheetState(() => role = r),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding:
                              const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: role == r
                                ? GodropColors.blue
                                : GodropColors.background,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: Text(
                              r == 'STAFF' ? 'Staff' : 'Manager',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: role == r
                                    ? GodropColors.white
                                    : GodropColors.slate,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    if (r == 'STAFF') const SizedBox(width: 10),
                  ],
                ],
              ),
              const SizedBox(height: 20),
              GodropButton(
                label: 'Send invite',
                onTap: () {
                  if (firstCtrl.text.trim().isEmpty ||
                      lastCtrl.text.trim().isEmpty ||
                      emailCtrl.text.trim().isEmpty) {
                    return;
                  }
                  Navigator.of(sheetCtx).pop(true);
                },
              ),
            ],
          ),
        ),
      ),
    );

    if (submitted != true) return;
    final err = await cubit.invite(
      email: emailCtrl.text.trim(),
      firstName: firstCtrl.text.trim(),
      lastName: lastCtrl.text.trim(),
      role: role,
    );
    if (!ctx.mounted) return;
    _toast(ctx, err ?? 'Invite sent to ${emailCtrl.text.trim()}',
        error: err != null);
  }

  Future<void> _memberActions(BuildContext ctx, TeamMember member) async {
    final cubit = ctx.read<TeamCubit>();
    final action = await showModalBottomSheet<String>(
      context: ctx,
      backgroundColor: GodropColors.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Text(member.fullName,
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            Text(member.email,
                style: const TextStyle(
                    fontSize: 13, color: GodropColors.mute)),
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.swap_horiz_rounded,
                  color: GodropColors.blue),
              title: Text(
                  'Make ${member.role == 'MANAGER' ? 'Staff' : 'Manager'}'),
              onTap: () => Navigator.of(sheetCtx).pop('role'),
            ),
            ListTile(
              leading: const Icon(Icons.person_remove_outlined,
                  color: GodropColors.error),
              title: const Text('Remove from team',
                  style: TextStyle(color: GodropColors.error)),
              onTap: () => Navigator.of(sheetCtx).pop('remove'),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (action == null || !ctx.mounted) return;

    String? err;
    if (action == 'role') {
      err = await cubit.updateRole(
          member.id, member.role == 'MANAGER' ? 'STAFF' : 'MANAGER');
    } else {
      err = await cubit.remove(member.id);
    }
    if (!ctx.mounted) return;
    _toast(
      ctx,
      err ??
          (action == 'role' ? 'Role updated' : '${member.fullName} removed'),
      error: err != null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isOwner = context.watch<SessionCubit>().isOwner;
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Team'),
          backgroundColor: GodropColors.background),
      floatingActionButton: isOwner
          ? Builder(
              builder: (fabCtx) => FloatingActionButton.extended(
                heroTag: 'team_fab',
                backgroundColor: GodropColors.blue,
                foregroundColor: GodropColors.white,
                icon: const Icon(Icons.person_add_alt_rounded),
                label: const Text('Invite'),
                onPressed: () => _inviteSheet(fabCtx),
              ),
            )
          : null,
      body: BlocBuilder<TeamCubit, TeamState>(
        builder: (ctx, state) {
          if (state is TeamLoading || state is TeamInitial) {
            return const ListSkeleton();
          }
          if (state is TeamError) {
            return EmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Could not load team',
              subtitle: state.message,
              actionLabel: 'Retry',
              onAction: () => ctx.read<TeamCubit>().load(),
            );
          }
          final members = (state as TeamLoaded)
              .members
              .where((m) => m.isActive)
              .toList();
          return RefreshIndicator(
            onRefresh: () => ctx.read<TeamCubit>().load(silent: true),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 96),
              itemCount: members.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, i) {
                final m = members[i];
                final canManage = isOwner && m.role != 'OWNER';
                return GestureDetector(
                  onTap: canManage ? () => _memberActions(ctx, m) : null,
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: GodropColors.card,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: GodropColors.softShadow,
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor:
                              GodropColors.blue.withValues(alpha: 0.10),
                          child: Text(
                            m.firstName.isNotEmpty
                                ? m.firstName[0].toUpperCase()
                                : '?',
                            style: const TextStyle(
                                color: GodropColors.blue,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(m.fullName,
                                  style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: GodropColors.ink)),
                              Text(m.email,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: GodropColors.mute)),
                            ],
                          ),
                        ),
                        _RoleBadge(role: m.role),
                        if (canManage)
                          const Padding(
                            padding: EdgeInsets.only(left: 4),
                            child: Icon(Icons.more_vert_rounded,
                                size: 18, color: GodropColors.mute),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String role;
  const _RoleBadge({required this.role});

  @override
  Widget build(BuildContext context) {
    final (color, label) = switch (role) {
      'OWNER' => (GodropColors.orange, 'Owner'),
      'MANAGER' => (GodropColors.blue, 'Manager'),
      _ => (GodropColors.mute, 'Staff'),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}
