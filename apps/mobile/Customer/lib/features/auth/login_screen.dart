import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifierCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _identifierCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _submit(BuildContext ctx) {
    final id = _identifierCtrl.text.trim();
    final pw = _passwordCtrl.text;
    if (id.isEmpty || pw.isEmpty) return;
    ctx.read<AuthCubit>().loginWithPassword(id, pw);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthAuthenticated) {
          ctx.go('/home');
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red.shade700,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              margin: const EdgeInsets.all(16),
            ),
          );
          ctx.read<AuthCubit>().reset();
        }
      },
      builder: (ctx, state) {
        final loading = state is AuthLoading;
        return Scaffold(
          backgroundColor: GodropColors.white,
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => ctx.go('/onboarding'),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.chevron_left_rounded, color: GodropColors.ink, size: 22),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.all(6),
                    child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
                  ),
                  const SizedBox(height: 20),
                  const Text('Welcome back', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: GodropColors.ink, letterSpacing: -0.4)),
                  const SizedBox(height: 8),
                  const Text('Sign in with your email or phone number.', style: TextStyle(fontSize: 15, color: GodropColors.slate, height: 1.45)),
                  const SizedBox(height: 32),
                  _Field(
                    controller: _identifierCtrl,
                    hint: 'Email or phone number',
                    keyboardType: TextInputType.emailAddress,
                    icon: Icons.person_outline_rounded,
                  ),
                  const SizedBox(height: 12),
                  _PasswordField(
                    controller: _passwordCtrl,
                    obscure: _obscure,
                    onToggle: () => setState(() => _obscure = !_obscure),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: GestureDetector(
                      onTap: () => ctx.go('/auth/forgot-password'),
                      child: const Text('Forgot password?', style: TextStyle(fontSize: 13, color: GodropColors.blue, fontWeight: FontWeight.w500)),
                    ),
                  ),
                  const SizedBox(height: 24),
                  GodropButton(
                    label: loading ? 'Signing in...' : 'Sign in',
                    onTap: loading ? null : () => _submit(ctx),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? ", style: TextStyle(fontSize: 14, color: GodropColors.slate)),
                      GestureDetector(
                        onTap: () => ctx.go('/auth/phone'),
                        child: const Text('Sign up', style: TextStyle(fontSize: 14, color: GodropColors.blue, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final TextInputType keyboardType;
  final IconData icon;
  const _Field({required this.controller, required this.hint, required this.keyboardType, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: GodropColors.border, width: 1.5), borderRadius: BorderRadius.circular(14)),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        style: const TextStyle(fontSize: 15, color: GodropColors.ink),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 15),
          prefixIcon: Icon(icon, size: 20, color: GodropColors.mute),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}

class _PasswordField extends StatelessWidget {
  final TextEditingController controller;
  final bool obscure;
  final VoidCallback onToggle;
  const _PasswordField({required this.controller, required this.obscure, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: GodropColors.border, width: 1.5), borderRadius: BorderRadius.circular(14)),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: const TextStyle(fontSize: 15, color: GodropColors.ink),
        decoration: InputDecoration(
          hintText: 'Password',
          hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 15),
          prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20, color: GodropColors.mute),
          suffixIcon: GestureDetector(
            onTap: onToggle,
            child: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: GodropColors.mute),
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
