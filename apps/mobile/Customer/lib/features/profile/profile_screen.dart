import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';
import '../../shared/services/user_prefs.dart';
import '../auth/bloc/auth_cubit.dart';
import '../auth/bloc/auth_state.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _pushNotifications = true;
  bool _uploadingAvatar = false;

  @override
  void initState() {
    super.initState();
    context.read<ProfileCubit>().load();
  }

  Future<void> _pickAndUploadAvatar() async {
    final choice = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: GodropColors.border, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Text('Update photo', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: GodropColors.ink)),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.camera_alt_rounded, color: GodropColors.blue),
              title: const Text('Take a photo', style: TextStyle(fontSize: 15, color: GodropColors.ink)),
              onTap: () => Navigator.pop(context, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: GodropColors.blue),
              title: const Text('Choose from gallery', style: TextStyle(fontSize: 15, color: GodropColors.ink)),
              onTap: () => Navigator.pop(context, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (choice == null) return;
    final picker = ImagePicker();
    final file = await picker.pickImage(source: choice, imageQuality: 85, maxWidth: 800);
    if (file == null || !mounted) return;
    setState(() => _uploadingAvatar = true);
    await context.read<ProfileCubit>().uploadAvatar(file.path);
    if (mounted) setState(() => _uploadingAvatar = false);
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

  void _showEditProfile(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _EditProfileSheet(),
    );
  }

  void _showChangePassword(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BlocProvider.value(
        value: ctx.read<AuthCubit>(),
        child: const _ChangePasswordSheet(),
      ),
    );
  }

  void _confirmSignOut(BuildContext ctx) {
    showDialog(
      context: ctx,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Sign out?', style: TextStyle(fontWeight: FontWeight.w700, color: GodropColors.ink)),
        content: const Text('You will need to sign in again to access your account.', style: TextStyle(color: GodropColors.slate)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancel', style: TextStyle(color: GodropColors.slate)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              ctx.read<AuthCubit>().logout();
            },
            child: const Text('Sign out', style: TextStyle(color: GodropColors.error, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccount(BuildContext ctx) {
    showDialog(
      context: ctx,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete account?', style: TextStyle(fontWeight: FontWeight.w700, color: GodropColors.ink)),
        content: const Text('This will permanently deactivate your account. This action cannot be undone.', style: TextStyle(color: GodropColors.slate)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancel', style: TextStyle(color: GodropColors.slate)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              ctx.read<AuthCubit>().deleteAccount();
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthLoggedOut || state is AuthAccountDeleted) {
          ctx.go('/onboarding');
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red.shade700, behavior: SnackBarBehavior.floating),
          );
          ctx.read<AuthCubit>().reset();
        }
      },
      child: BlocBuilder<ProfileCubit, ProfileState>(
        builder: (context, state) {
          final profile = state is ProfileLoaded ? state.profile : null;
          final walletBalance = profile != null ? _fmtKobo(profile.walletBalanceKobo) : '—';
          final name = profile != null ? '${profile.firstName} ${profile.lastName}' : '';
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
                            GestureDetector(
                              onTap: _pickAndUploadAvatar,
                              child: Stack(
                                children: [
                                  Container(
                                    width: 64,
                                    height: 64,
                                    decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [Color(0xFF7B4FA3), Color(0xFFC4478A)])),
                                    child: _uploadingAvatar
                                        ? const Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)))
                                        : profile?.avatarUrl != null
                                            ? ClipOval(child: Image.network(profile!.avatarUrl!, fit: BoxFit.cover, width: 64, height: 64, errorBuilder: (_, __, ___) => Center(child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)))))
                                            : state is ProfileLoading
                                                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                                : Center(child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700))),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: Container(
                                      width: 20,
                                      height: 20,
                                      decoration: const BoxDecoration(color: GodropColors.orange, shape: BoxShape.circle),
                                      child: const Icon(Icons.camera_alt_rounded, size: 12, color: Colors.white),
                                    ),
                                  ),
                                ],
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
                              Expanded(child: _StatItem(
                                value: state is ProfileLoaded ? '${state.orderCount}' : '—',
                                label: 'Orders',
                              )),
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _PSectionLabel('ACCOUNT'),
                        const SizedBox(height: 8),
                        _PGroup(children: [
                          _PTile(
                            icon: Icons.person_outline_rounded,
                            label: 'Edit profile',
                            onTap: () => _showEditProfile(context),
                          ),
                          const Divider(height: 1, indent: 52),
                          _PTile(
                            icon: Icons.lock_outline_rounded,
                            label: 'Change password',
                            trailing: const Text('Update', style: TextStyle(fontSize: 13, color: GodropColors.blue, fontWeight: FontWeight.w500)),
                            onTap: () => _showChangePassword(context),
                          ),
                          const Divider(height: 1, indent: 52),
                          _PTile(
                            icon: Icons.credit_card_rounded,
                            label: 'Saved cards',
                            onTap: () => context.push('/cards'),
                          ),
                        ]),
                        const SizedBox(height: 20),
                        _PSectionLabel('PREFERENCES'),
                        const SizedBox(height: 8),
                        _PGroup(children: [
                          _PToggle(
                            icon: Icons.notifications_outlined,
                            label: 'Push notifications',
                            value: _pushNotifications,
                            onChanged: (v) => setState(() => _pushNotifications = v),
                          ),
                        ]),
                        const SizedBox(height: 20),
                        _PSectionLabel('LEGAL'),
                        const SizedBox(height: 8),
                        _PGroup(children: [
                          _PTile(
                            icon: Icons.privacy_tip_outlined,
                            label: 'Privacy policy',
                            onTap: () => context.push('/webview?url=${Uri.encodeComponent('https://naijagodrop.com/privacy-policy')}&title=Privacy+Policy'),
                          ),
                          const Divider(height: 1, indent: 52),
                          _PTile(
                            icon: Icons.article_outlined,
                            label: 'Terms of service',
                            onTap: () => context.push('/webview?url=${Uri.encodeComponent('https://naijagodrop.com/terms-of-service')}&title=Terms+of+Service'),
                          ),
                        ]),
                        const SizedBox(height: 20),
                        _PGroup(children: [
                          _PTile(
                            icon: Icons.logout_rounded,
                            label: 'Sign out',
                            labelColor: GodropColors.error,
                            iconColor: GodropColors.error,
                            onTap: () => _confirmSignOut(context),
                          ),
                          const Divider(height: 1, indent: 52),
                          _PTile(
                            icon: Icons.delete_forever_rounded,
                            label: 'Delete account',
                            labelColor: Colors.red,
                            iconColor: Colors.red,
                            onTap: () => _showDeleteAccount(context),
                          ),
                        ]),
                        const SizedBox(height: 28),
                      ],
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
                          Expanded(child: Text(state.message, style: const TextStyle(fontSize: 12, color: GodropColors.slate))),
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

// ── Profile menu components ───────────────────────────────────────────────────

class _PSectionLabel extends StatelessWidget {
  final String text;
  const _PSectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: GodropColors.mute, letterSpacing: 0.8));
  }
}

class _PGroup extends StatelessWidget {
  final List<Widget> children;
  const _PGroup({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
      child: Column(children: children),
    );
  }
}

class _PTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget? trailing;
  final Color? labelColor;
  final Color? iconColor;
  final VoidCallback onTap;
  const _PTile({required this.icon, required this.label, this.trailing, this.labelColor, this.iconColor, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor ?? GodropColors.slate),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: TextStyle(fontSize: 14, color: labelColor ?? GodropColors.ink, fontWeight: FontWeight.w500))),
            if (trailing != null) trailing!,
            if (trailing == null) const Icon(Icons.chevron_right_rounded, size: 18, color: GodropColors.mute),
          ],
        ),
      ),
    );
  }
}

class _PToggle extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _PToggle({required this.icon, required this.label, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: GodropColors.slate),
          const SizedBox(width: 14),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 14, color: GodropColors.ink, fontWeight: FontWeight.w500))),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: GodropColors.blue,
            activeTrackColor: GodropColors.blue.withValues(alpha: 0.4),
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
        ],
      ),
    );
  }
}

// ── Change Password Sheet ─────────────────────────────────────────────────────

class _ChangePasswordSheet extends StatefulWidget {
  const _ChangePasswordSheet();

  @override
  State<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends State<_ChangePasswordSheet> {
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _saving = false;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_newCtrl.text != _confirmCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match'), backgroundColor: Colors.red),
      );
      return;
    }
    if (_newCtrl.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password must be at least 6 characters'), backgroundColor: Colors.red),
      );
      return;
    }
    setState(() => _saving = true);
    context.read<AuthCubit>().changePassword(_currentCtrl.text, _newCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (ctx, state) {
        setState(() => _saving = false);
        if (state is AuthPasswordChanged) {
          Navigator.pop(ctx);
          ScaffoldMessenger.of(ctx).showSnackBar(
            const SnackBar(content: Text('Password changed successfully'), backgroundColor: Colors.green),
          );
          ctx.read<AuthCubit>().reset();
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
          ctx.read<AuthCubit>().reset();
        }
      },
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: GodropColors.border, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 20),
            const Text('Change password', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: GodropColors.ink)),
            const SizedBox(height: 20),
            _PwField(controller: _currentCtrl, hint: 'Current password', obscure: _obscureCurrent, onToggle: () => setState(() => _obscureCurrent = !_obscureCurrent)),
            const SizedBox(height: 12),
            _PwField(controller: _newCtrl, hint: 'New password', obscure: _obscureNew, onToggle: () => setState(() => _obscureNew = !_obscureNew)),
            const SizedBox(height: 12),
            _PwField(controller: _confirmCtrl, hint: 'Confirm new password', obscure: _obscureNew, onToggle: () => setState(() => _obscureNew = !_obscureNew)),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: GodropColors.blue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Update password', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PwField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final bool obscure;
  final VoidCallback onToggle;
  const _PwField({required this.controller, required this.hint, required this.obscure, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: GodropColors.mute),
        suffixIcon: GestureDetector(onTap: onToggle, child: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: GodropColors.mute)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GodropColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GodropColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GodropColors.blue)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }
}

// ── Edit Profile Sheet ────────────────────────────────────────────────────────

class _EditProfileSheet extends StatefulWidget {
  const _EditProfileSheet();

  @override
  State<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends State<_EditProfileSheet> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final name = UserPrefs.name.split(' ');
    _firstNameCtrl.text = name.isNotEmpty ? name.first : '';
    _lastNameCtrl.text = name.length > 1 ? name.skip(1).join(' ') : '';
    _emailCtrl.text = UserPrefs.email;
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_firstNameCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      final dio = DioClient.instance;
      await dio.patch('/me', data: {
        'firstName': _firstNameCtrl.text.trim(),
        'lastName': _lastNameCtrl.text.trim(),
        if (_emailCtrl.text.trim().isNotEmpty) 'email': _emailCtrl.text.trim(),
      });
      await UserPrefs.saveProfile(
        name: '${_firstNameCtrl.text.trim()} ${_lastNameCtrl.text.trim()}',
        email: _emailCtrl.text.trim(),
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: GodropColors.border, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 20),
          const Text('Edit profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: GodropColors.ink)),
          const SizedBox(height: 20),
          _ProfileField(controller: _firstNameCtrl, hint: 'First name'),
          const SizedBox(height: 12),
          _ProfileField(controller: _lastNameCtrl, hint: 'Last name'),
          const SizedBox(height: 12),
          _ProfileField(controller: _emailCtrl, hint: 'Email address', keyboard: TextInputType.emailAddress),
          const SizedBox(height: 8),
          const Text('Phone number cannot be changed.', style: TextStyle(fontSize: 12, color: GodropColors.mute)),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: GodropColors.blue,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _saving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Save changes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final TextInputType keyboard;
  const _ProfileField({required this.controller, required this.hint, this.keyboard = TextInputType.text});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: GodropColors.mute),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GodropColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GodropColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: GodropColors.blue)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }
}
