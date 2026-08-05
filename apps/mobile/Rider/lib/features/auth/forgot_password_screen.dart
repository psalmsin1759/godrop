import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  void _submit(BuildContext ctx) {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) return;
    ctx.read<AuthCubit>().forgotPassword(email);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthForgotPasswordSent) {
          showDialog(
            context: ctx,
            builder: (_) => AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              title: const Text('Check your email',
                  style: TextStyle(
                      fontWeight: FontWeight.w700, color: GodropColors.ink)),
              content: const Text(
                  'If a rider account exists with that email, a password reset link has been sent.',
                  style: TextStyle(color: GodropColors.slate)),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ctx.go('/auth/login');
                  },
                  child: const Text('OK',
                      style: TextStyle(
                          color: GodropColors.blue,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          );
          ctx.read<AuthCubit>().reset();
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red.shade700,
                behavior: SnackBarBehavior.floating),
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
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 12),
                      GodropBackButton(onTap: () => ctx.go('/auth/login')),
                      const SizedBox(height: 40),
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
                        child: const Icon(Icons.lock_reset_rounded,
                            color: GodropColors.white, size: 26),
                      ),
                      const SizedBox(height: 20),
                      const Text('Reset password',
                          style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                              letterSpacing: -0.4)),
                      const SizedBox(height: 8),
                      const Text(
                          "Enter the email address linked to your rider account and we'll send you a reset link.",
                          style: TextStyle(
                              fontSize: 15,
                              color: GodropColors.slate,
                              height: 1.45)),
                      const SizedBox(height: 32),
                      Container(
                        decoration: BoxDecoration(
                          color: GodropColors.card,
                          border: Border.all(
                              color: GodropColors.border, width: 1.5),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                                color: GodropColors.ink.withValues(alpha: 0.04),
                                blurRadius: 12,
                                offset: const Offset(0, 4)),
                          ],
                        ),
                        child: TextField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(
                              fontSize: 15, color: GodropColors.ink),
                          decoration: const InputDecoration(
                            hintText: 'Email address',
                            hintStyle: TextStyle(
                                color: GodropColors.mute, fontSize: 15),
                            prefixIcon: Icon(Icons.email_outlined,
                                size: 20, color: GodropColors.mute),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      GodropButton(
                        label: loading ? 'Sending...' : 'Send reset link',
                        onTap: loading ? null : () => _submit(ctx),
                        isLoading: loading,
                      ),
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
