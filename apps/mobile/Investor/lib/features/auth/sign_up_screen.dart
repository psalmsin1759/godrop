import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_mark.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/invest_field.dart';
import 'bloc/auth_cubit.dart';

/// Screen 05 — create account: name, email, phone, password, terms.
class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _agreed = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  /// Accepts `0803…` local input and normalizes to `+234…`.
  String get _normalizedPhone {
    var p = _phone.text.replaceAll(RegExp(r'[\s-]'), '');
    if (p.startsWith('0')) p = '+234${p.substring(1)}';
    if (!p.startsWith('+')) p = '+234$p';
    return p;
  }

  void _submit() {
    final parts = _name.text.trim().split(RegExp(r'\s+'));
    if (parts.length < 2) {
      _showError('Enter your full name (first and last).');
      return;
    }
    if (!_agreed) {
      _showError('Please accept the Terms and Risk Disclosure.');
      return;
    }
    context.read<AuthCubit>().register(
          firstName: parts.first,
          lastName: parts.sublist(1).join(' '),
          email: _email.text.trim(),
          phone: _normalizedPhone,
          password: _password.text,
        );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: InvestColors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthOtpPending) {
            context.push('/auth/otp', extra: state.phone);
          } else if (state is AuthError) {
            _showError(state.message);
          }
        },
        builder: (context, state) {
          final loading = state is AuthLoading;
          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(22, 18, 22, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const GoDropMark(size: 40),
                  const SizedBox(height: 20),
                  const Text(
                    'Create your account',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.6,
                      color: InvestColors.text,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Start investing in as little as 2 minutes.',
                    style: TextStyle(fontSize: 14, color: InvestColors.sub),
                  ),
                  const SizedBox(height: 24),
                  InvestField(
                    label: 'Full name',
                    controller: _name,
                    hint: 'Amara Nwosu',
                    icon: Icons.person_outline,
                  ),
                  InvestField(
                    label: 'Email address',
                    controller: _email,
                    hint: 'you@example.com',
                    icon: Icons.mail_outline,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  InvestField(
                    label: 'Phone number',
                    controller: _phone,
                    hint: '0803 552 7710',
                    icon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                  InvestField(
                    label: 'Password',
                    controller: _password,
                    hint: 'At least 8 characters',
                    icon: Icons.lock_outline,
                    obscure: _obscure,
                    trailing: GestureDetector(
                      onTap: () => setState(() => _obscure = !_obscure),
                      child: Icon(
                        _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        size: 18,
                        color: InvestColors.mute,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GestureDetector(
                        onTap: () => setState(() => _agreed = !_agreed),
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(
                            color: _agreed ? InvestColors.blue : InvestColors.raise2,
                            borderRadius: BorderRadius.circular(6),
                            border: _agreed ? null : Border.all(color: InvestColors.line2),
                          ),
                          child: _agreed
                              ? const Icon(Icons.check, size: 14, color: Colors.white)
                              : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text.rich(
                          TextSpan(
                            text: "I agree to GoDrop's ",
                            style: TextStyle(
                                fontSize: 12, height: 1.5, color: InvestColors.sub),
                            children: [
                              TextSpan(
                                text: 'Terms of Service',
                                style: TextStyle(
                                  color: InvestColors.blueBright,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              TextSpan(text: ' and '),
                              TextSpan(
                                text: 'Investment Risk Disclosure',
                                style: TextStyle(
                                  color: InvestColors.blueBright,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              TextSpan(text: '.'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  InvestButton(
                    label: 'Create account',
                    trailingIcon: Icons.arrow_forward,
                    loading: loading,
                    onPressed: loading ? null : _submit,
                  ),
                  const SizedBox(height: 18),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.go('/auth/sign-in'),
                      child: const Text.rich(
                        TextSpan(
                          text: 'Already have an account? ',
                          style: TextStyle(fontSize: 13.5, color: InvestColors.sub),
                          children: [
                            TextSpan(
                              text: 'Sign in',
                              style: TextStyle(
                                color: InvestColors.blueBright,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
