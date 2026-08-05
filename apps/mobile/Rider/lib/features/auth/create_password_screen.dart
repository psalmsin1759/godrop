import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class CreatePasswordScreen extends StatefulWidget {
  final String riderId;
  const CreatePasswordScreen({super.key, required this.riderId});

  @override
  State<CreatePasswordScreen> createState() => _CreatePasswordScreenState();
}

class _CreatePasswordScreenState extends State<CreatePasswordScreen> {
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _error;

  @override
  void dispose() {
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _submit(BuildContext ctx) {
    final password = _passwordCtrl.text;
    final confirm = _confirmCtrl.text;
    if (password.length < 6) {
      setState(() => _error = 'Password must be at least 6 characters');
      return;
    }
    if (password != confirm) {
      setState(() => _error = "Passwords don't match");
      return;
    }
    setState(() => _error = null);
    ctx.read<AuthCubit>().setPassword(widget.riderId, password);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthAuthenticated) {
          ctx.go('/jobs');
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red.shade700,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              margin: const EdgeInsets.all(16),
            ),
          );
          ctx.read<AuthCubit>().reset();
        }
      },
      builder: (ctx, state) {
        final loading = state is AuthLoading;
        return Scaffold(
          backgroundColor: GodropColors.background,
          body: Stack(
            children: [
              const BackgroundBlobs(
                  topColor: GodropColors.blue,
                  bottomColor: GodropColors.orange),
              SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 60),
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          gradient: GodropColors.blueGradient,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                                color:
                                    GodropColors.blue.withValues(alpha: 0.35),
                                blurRadius: 16,
                                offset: const Offset(0, 6)),
                          ],
                        ),
                        child: const Icon(Icons.lock_outline_rounded,
                            color: GodropColors.white, size: 26),
                      ),
                      const SizedBox(height: 24),
                      const Text('Create a password',
                          style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                              letterSpacing: -0.4)),
                      const SizedBox(height: 8),
                      const Text(
                          "You're verified! Set a password so you can sign in with your phone or email from now on.",
                          style: TextStyle(
                              fontSize: 15,
                              color: GodropColors.slate,
                              height: 1.45)),
                      const SizedBox(height: 28),
                      _PasswordField(
                        controller: _passwordCtrl,
                        hint: 'New password',
                        obscure: _obscurePassword,
                        onToggle: () =>
                            setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      const SizedBox(height: 12),
                      _PasswordField(
                        controller: _confirmCtrl,
                        hint: 'Confirm password',
                        obscure: _obscureConfirm,
                        onToggle: () =>
                            setState(() => _obscureConfirm = !_obscureConfirm),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 10),
                        Text(_error!,
                            style: const TextStyle(
                                fontSize: 13, color: GodropColors.error)),
                      ],
                      const SizedBox(height: 24),
                      GodropButton(
                        label: loading ? 'Saving...' : 'Create password',
                        onTap: loading ? null : () => _submit(ctx),
                        isLoading: loading,
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PasswordField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final bool obscure;
  final VoidCallback onToggle;
  const _PasswordField({
    required this.controller,
    required this.hint,
    required this.obscure,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GodropColors.card,
        border: Border.all(color: GodropColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: GodropColors.ink.withValues(alpha: 0.04),
              blurRadius: 12,
              offset: const Offset(0, 4)),
        ],
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: const TextStyle(fontSize: 15, color: GodropColors.ink),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 15),
          prefixIcon: const Icon(Icons.lock_outline_rounded,
              size: 20, color: GodropColors.mute),
          suffixIcon: GestureDetector(
            onTap: onToggle,
            child: Icon(
                obscure
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: GodropColors.mute),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
