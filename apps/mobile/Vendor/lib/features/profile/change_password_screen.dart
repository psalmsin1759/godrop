import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/admin_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../auth/bloc/auth_cubit.dart' show parseDioError;

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;
  bool _saving = false;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
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
    if (_newCtrl.text.length < 8) {
      return _toast('New password must be at least 8 characters');
    }
    if (_newCtrl.text != _confirmCtrl.text) {
      return _toast('Passwords do not match');
    }
    setState(() => _saving = true);
    try {
      await ProfileService(DioClient.instance).changePassword(
        ChangePasswordBody(
          currentPassword: _currentCtrl.text,
          newPassword: _newCtrl.text,
        ),
      );
      if (!mounted) return;
      _toast('Password changed', error: false);
      context.pop();
      return;
    } on DioException catch (e) {
      if (mounted) _toast(parseDioError(e));
    } catch (_) {
      if (mounted) _toast('Could not change your password.');
    }
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) {
    final eye = GestureDetector(
      onTap: () => setState(() => _obscure = !_obscure),
      child: Icon(
          _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          size: 20,
          color: GodropColors.mute),
    );
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Change password'),
          backgroundColor: GodropColors.background),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GodropField(
              controller: _currentCtrl,
              label: 'Current password',
              hint: 'Current password',
              obscure: _obscure,
              icon: Icons.lock_outline_rounded,
              suffix: eye,
            ),
            const SizedBox(height: 14),
            GodropField(
              controller: _newCtrl,
              label: 'New password (min. 8 characters)',
              hint: 'New password',
              obscure: _obscure,
              icon: Icons.lock_reset_rounded,
            ),
            const SizedBox(height: 14),
            GodropField(
              controller: _confirmCtrl,
              label: 'Confirm new password',
              hint: 'Repeat new password',
              obscure: _obscure,
              icon: Icons.lock_reset_rounded,
            ),
            const SizedBox(height: 28),
            GodropButton(
              label: _saving ? 'Updating...' : 'Update password',
              onTap: _saving ? null : _save,
            ),
          ],
        ),
      ),
    );
  }
}
