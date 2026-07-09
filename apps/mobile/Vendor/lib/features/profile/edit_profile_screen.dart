import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/admin_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../../shared/widgets/section_header.dart';
import '../auth/bloc/auth_cubit.dart' show parseDioError;
import 'bloc/session_cubit.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _profileService = ProfileService(DioClient.instance);

  bool _saving = false;
  bool _emailNotifications = true;
  bool _orderAlerts = true;
  bool _settingsLoaded = false;

  @override
  void initState() {
    super.initState();
    final admin = context.read<SessionCubit>().state;
    _firstCtrl.text = admin?.firstName ?? '';
    _lastCtrl.text = admin?.lastName ?? '';
    _emailCtrl.text = admin?.email ?? '';
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final res = await _profileService.getSettings();
      if (!mounted) return;
      setState(() {
        _emailNotifications = res.data.emailNotifications;
        _orderAlerts = res.data.orderAlerts;
        _settingsLoaded = true;
      });
    } catch (_) {
      if (mounted) setState(() => _settingsLoaded = true);
    }
  }

  @override
  void dispose() {
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  void _toast(String msg, {bool error = true}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red.shade700 : GodropColors.success,
      behavior: SnackBarBehavior.floating,
    ));
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await _profileService.updateProfile(UpdateProfileBody(
        firstName: _firstCtrl.text.trim(),
        lastName: _lastCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
      ));
      await _profileService.updateSettings(UpdateProfileSettingsBody(
        emailNotifications: _emailNotifications,
        orderAlerts: _orderAlerts,
      ));
      if (!mounted) return;
      context.read<SessionCubit>().load();
      _toast('Profile updated', error: false);
      context.pop();
      return;
    } on DioException catch (e) {
      if (mounted) _toast(parseDioError(e));
    } catch (_) {
      if (mounted) _toast('Could not save your profile.');
    }
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Edit profile'),
          backgroundColor: GodropColors.background),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GodropField(
                controller: _firstCtrl,
                label: 'First name',
                hint: 'First name'),
            const SizedBox(height: 14),
            GodropField(
                controller: _lastCtrl, label: 'Last name', hint: 'Last name'),
            const SizedBox(height: 14),
            GodropField(
                controller: _emailCtrl,
                label: 'Email',
                hint: 'Email address',
                keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 24),
            const GodropSectionHeader(title: 'Notification preferences'),
            const SizedBox(height: 14),
            if (!_settingsLoaded)
              const Center(
                  child: Padding(
                padding: EdgeInsets.all(8),
                child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2)),
              ))
            else ...[
              _PrefTile(
                title: 'Email notifications',
                subtitle: 'Summaries and account updates by email',
                value: _emailNotifications,
                onChanged: (v) => setState(() => _emailNotifications = v),
              ),
              const SizedBox(height: 10),
              _PrefTile(
                title: 'Order alerts',
                subtitle: 'Get notified when new orders come in',
                value: _orderAlerts,
                onChanged: (v) => setState(() => _orderAlerts = v),
              ),
            ],
            const SizedBox(height: 28),
            GodropButton(
              label: _saving ? 'Saving...' : 'Save changes',
              onTap: _saving ? null : _save,
            ),
          ],
        ),
      ),
    );
  }
}

class _PrefTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _PrefTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border, width: 1.5),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
                Text(subtitle,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute)),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            activeTrackColor: GodropColors.success,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
