import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _sent = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthForgotPasswordSent) {
          setState(() => _sent = true);
          ctx.read<AuthCubit>().reset();
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red.shade700,
              behavior: SnackBarBehavior.floating,
              shape:
                  RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                      const SizedBox(height: 12),
                      GodropBackButton(onTap: () => ctx.go('/auth/login')),
                      const SizedBox(height: 32),
                      Text(_sent ? 'Check your email' : 'Reset password',
                          style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                              letterSpacing: -0.4)),
                      const SizedBox(height: 8),
                      Text(
                        _sent
                            ? 'If an account exists for that email, a reset link is on its way. Follow the link, then sign in with your new password.'
                            : "Enter your account email and we'll send you a reset link.",
                        style: const TextStyle(
                            fontSize: 15,
                            color: GodropColors.slate,
                            height: 1.45),
                      ),
                      const SizedBox(height: 32),
                      if (!_sent) ...[
                        GodropField(
                          controller: _emailCtrl,
                          hint: 'Email address',
                          keyboardType: TextInputType.emailAddress,
                          icon: Icons.mail_outline_rounded,
                        ),
                        const SizedBox(height: 24),
                        GodropButton(
                          label: loading ? 'Sending...' : 'Send reset link',
                          onTap: loading
                              ? null
                              : () {
                                  final email = _emailCtrl.text.trim();
                                  if (email.isEmpty) return;
                                  ctx.read<AuthCubit>().forgotPassword(email);
                                },
                        ),
                      ] else
                        GodropButton(
                          label: 'Back to sign in',
                          onTap: () => ctx.go('/auth/login'),
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
