import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_mark.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/invest_field.dart';
import 'bloc/auth_cubit.dart';

/// Screen 07 — sign in with email/phone + password.
class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _identifier = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _identifier.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (_identifier.text.trim().isEmpty || _password.text.isEmpty) return;
    context.read<AuthCubit>().login(_identifier.text.trim(), _password.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            context.go('/home');
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: InvestColors.red),
            );
          }
        },
        builder: (context, state) {
          final loading = state is AuthLoading;
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 30, 22, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const GoDropMark(size: 44),
                          const SizedBox(height: 26),
                          const Text(
                            'Welcome back',
                            style: TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.7,
                              color: InvestColors.text,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Sign in to manage your investments.',
                            style: TextStyle(fontSize: 14.5, color: InvestColors.sub),
                          ),
                          const SizedBox(height: 30),
                          InvestField(
                            label: 'Email or phone',
                            controller: _identifier,
                            hint: 'amara.nwosu@ymail.com',
                            icon: Icons.person_outline,
                            keyboardType: TextInputType.emailAddress,
                          ),
                          InvestField(
                            label: 'Password',
                            controller: _password,
                            hint: 'Your password',
                            icon: Icons.lock_outline,
                            obscure: _obscure,
                            trailing: GestureDetector(
                              onTap: () => setState(() => _obscure = !_obscure),
                              child: Icon(
                                _obscure
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 18,
                                color: InvestColors.mute,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Align(
                            alignment: Alignment.centerRight,
                            child: Text(
                              'Forgot password?',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: InvestColors.blueBright,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  InvestButton(
                    label: 'Sign in',
                    trailingIcon: Icons.arrow_forward,
                    loading: loading,
                    onPressed: loading ? null : _submit,
                  ),
                  const SizedBox(height: 20),
                  const Row(
                    children: [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        child: Text('or',
                            style: TextStyle(
                                fontSize: 12, color: InvestColors.mute)),
                      ),
                      Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    height: 52,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(13),
                      border: Border.all(color: InvestColors.line2),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.g_mobiledata, size: 28, color: InvestColors.text),
                        SizedBox(width: 6),
                        Text(
                          'Continue with Google',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: InvestColors.text,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.go('/auth/sign-up'),
                      child: const Text.rich(
                        TextSpan(
                          text: 'New to GoDrop? ',
                          style: TextStyle(fontSize: 13.5, color: InvestColors.sub),
                          children: [
                            TextSpan(
                              text: 'Create account',
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
