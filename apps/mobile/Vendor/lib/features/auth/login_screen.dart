import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _submit(BuildContext ctx) {
    final email = _emailCtrl.text.trim();
    final pw = _passwordCtrl.text;
    if (email.isEmpty || pw.isEmpty) return;
    ctx.read<AuthCubit>().login(email, pw);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthAuthenticated) {
          ctx.read<SessionCubit>().set(state.admin);
          ctx.go('/dashboard');
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
                      const SizedBox(height: 60),
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: GodropColors.card,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                                color:
                                    GodropColors.ink.withValues(alpha: 0.06),
                                blurRadius: 10,
                                offset: const Offset(0, 3)),
                          ],
                        ),
                        padding: const EdgeInsets.all(6),
                        child: Image.asset('assets/images/logo.png',
                            fit: BoxFit.contain),
                      ),
                      const SizedBox(height: 20),
                      const Text('Vendor sign in',
                          style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                              letterSpacing: -0.4)),
                      const SizedBox(height: 8),
                      const Text(
                          'Manage your store, orders, and payouts on Godrop.',
                          style: TextStyle(
                              fontSize: 15,
                              color: GodropColors.slate,
                              height: 1.45)),
                      const SizedBox(height: 32),
                      GodropField(
                        controller: _emailCtrl,
                        hint: 'Email address',
                        keyboardType: TextInputType.emailAddress,
                        icon: Icons.mail_outline_rounded,
                      ),
                      const SizedBox(height: 12),
                      GodropField(
                        controller: _passwordCtrl,
                        hint: 'Password',
                        obscure: _obscure,
                        icon: Icons.lock_outline_rounded,
                        suffix: GestureDetector(
                          onTap: () => setState(() => _obscure = !_obscure),
                          child: Icon(
                              _obscure
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              size: 20,
                              color: GodropColors.mute),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: () => ctx.go('/auth/forgot-password'),
                          child: const Text('Forgot password?',
                              style: TextStyle(
                                  fontSize: 13,
                                  color: GodropColors.blue,
                                  fontWeight: FontWeight.w500)),
                        ),
                      ),
                      const SizedBox(height: 24),
                      GodropButton(
                        label: loading ? 'Signing in...' : 'Sign in',
                        onTap: loading ? null : () => _submit(ctx),
                      ),
                      const SizedBox(height: 24),
                      Center(
                        child: GestureDetector(
                          onTap: () => ctx.go('/auth/onboard'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 18, vertical: 10),
                            decoration: BoxDecoration(
                              color:
                                  GodropColors.blue.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: RichText(
                              text: const TextSpan(
                                style: TextStyle(
                                    fontSize: 13, color: GodropColors.slate),
                                children: [
                                  TextSpan(text: 'New vendor? '),
                                  TextSpan(
                                      text: 'Apply here',
                                      style: TextStyle(
                                          color: GodropColors.blue,
                                          fontWeight: FontWeight.w700)),
                                ],
                              ),
                            ),
                          ),
                        ),
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
