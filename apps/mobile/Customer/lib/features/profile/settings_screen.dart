import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';
import '../../shared/services/user_prefs.dart';
import '../auth/bloc/auth_cubit.dart';
import '../auth/bloc/auth_state.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _pushNotifications = true;

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
      child: Scaffold(
        backgroundColor: GodropColors.background,
        appBar: AppBar(
          backgroundColor: GodropColors.white,
          leading: GestureDetector(onTap: () => context.go('/profile'), child: const Icon(Icons.chevron_left_rounded, size: 28)),
          title: const Text('Settings'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionHeader('ACCOUNT'),
              const SizedBox(height: 8),
              _SettingsCard(children: [
                _SettingsTile(
                  label: 'Edit profile',
                  icon: Icons.person_outline_rounded,
                  onTap: () => _showEditProfile(context),
                ),
                const Divider(height: 1, indent: 52),
                _SettingsTile(
                  label: 'Change password',
                  icon: Icons.lock_outline_rounded,
                  trailing: const Text('Update', style: TextStyle(fontSize: 13, color: GodropColors.blue, fontWeight: FontWeight.w500)),
                  onTap: () => _showChangePassword(context),
                ),
                const Divider(height: 1, indent: 52),
                _SettingsTile(
                  label: 'Saved cards',
                  icon: Icons.credit_card_rounded,
                  onTap: () => context.push('/cards'),
                ),
              ]),
              const SizedBox(height: 20),
              _SectionHeader('PREFERENCES'),
              const SizedBox(height: 8),
              _SettingsCard(children: [
                _SettingsToggle(
                  label: 'Push notifications',
                  icon: Icons.notifications_outlined,
                  value: _pushNotifications,
                  onChanged: (v) => setState(() => _pushNotifications = v),
                ),
              ]),
              const SizedBox(height: 20),
              _SectionHeader('LEGAL'),
              const SizedBox(height: 8),
              _SettingsCard(children: [
                _SettingsTile(
                  label: 'Privacy policy',
                  icon: Icons.privacy_tip_outlined,
                  onTap: () => context.push('/webview?url=${Uri.encodeComponent('https://naijagodrop.com/privacy-policy')}&title=Privacy+Policy'),
                ),
                const Divider(height: 1, indent: 52),
                _SettingsTile(
                  label: 'Terms of service',
                  icon: Icons.article_outlined,
                  onTap: () => context.push('/webview?url=${Uri.encodeComponent('https://naijagodrop.com/terms-of-service')}&title=Terms+of+Service'),
                ),
              ]),
              const SizedBox(height: 20),
              _SettingsCard(children: [
                _SettingsTile(
                  label: 'Sign out',
                  icon: Icons.logout_rounded,
                  labelColor: GodropColors.error,
                  iconColor: GodropColors.error,
                  onTap: () => _confirmSignOut(context),
                ),
                const Divider(height: 1, indent: 52),
                _SettingsTile(
                  label: 'Delete account',
                  icon: Icons.delete_forever_rounded,
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
    );
  }

  void _showEditProfile(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _EditProfileSheet(),
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
}

// ── Change Password Sheet ─────────────────────────────────────

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

// ── Edit Profile Sheet ────────────────────────────────────────

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
    // Pre-fill from UserPrefs if available
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

// ── Shared UI components ──────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: GodropColors.mute, letterSpacing: 0.8));
  }
}

class _SettingsCard extends StatelessWidget {
  final List<Widget> children;
  const _SettingsCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
      child: Column(children: children),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final Widget? trailing;
  final Color? labelColor;
  final Color? iconColor;
  final VoidCallback onTap;
  const _SettingsTile({required this.label, required this.icon, this.trailing, this.labelColor, this.iconColor, required this.onTap});

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

class _SettingsToggle extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _SettingsToggle({required this.label, required this.icon, required this.value, required this.onChanged});

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
