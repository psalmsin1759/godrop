import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'NG');
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _sendCode(BuildContext ctx) {
    final phone = _phoneNumber.phoneNumber;
    if (phone == null || phone.trim().length < 6) return;
    ctx.read<AuthCubit>().requestOtp(phone);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthOtpSent) {
          ctx.go('/auth/otp?phone=${Uri.encodeComponent(state.phone)}');
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
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 12),
                      GodropBackButton(onTap: () => ctx.go('/onboarding')),
                      const SizedBox(height: 32),
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: GodropColors.card,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                                color: GodropColors.ink.withValues(alpha: 0.06),
                                blurRadius: 10,
                                offset: const Offset(0, 3)),
                          ],
                        ),
                        padding: const EdgeInsets.all(6),
                        child: Image.asset('assets/images/logo.png',
                            fit: BoxFit.contain),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        "What's your number?",
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "We'll text you a code to verify.",
                        style: TextStyle(
                            fontSize: 15,
                            color: GodropColors.slate,
                            height: 1.45),
                      ),
                      const SizedBox(height: 28),
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
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: InternationalPhoneNumberInput(
                          onInputChanged: (PhoneNumber number) {
                            setState(() => _phoneNumber = number);
                          },
                          initialValue: PhoneNumber(isoCode: 'NG'),
                          countries: const ['NG'],
                          selectorConfig: const SelectorConfig(
                            selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
                            showFlags: true,
                            leadingPadding: 10,
                            trailingSpace: false,
                          ),
                          textFieldController: _phoneController,
                          inputDecoration: const InputDecoration(
                            hintText: '801 222 3333',
                            hintStyle: TextStyle(
                                color: GodropColors.mute, fontSize: 15),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 16),
                          ),
                          inputBorder: InputBorder.none,
                          spaceBetweenSelectorAndTextField: 0,
                          textStyle: const TextStyle(
                            fontSize: 15,
                            color: GodropColors.ink,
                            fontWeight: FontWeight.w400,
                          ),
                          selectorTextStyle: const TextStyle(
                            fontSize: 15,
                            color: GodropColors.ink,
                            fontWeight: FontWeight.w500,
                          ),
                          cursorColor: GodropColors.blue,
                        ),
                      ),
                      const SizedBox(height: 10),
                      RichText(
                        text: const TextSpan(
                          style: TextStyle(
                              fontSize: 12.5, color: GodropColors.mute),
                          children: [
                            TextSpan(text: 'By continuing you agree to our '),
                            TextSpan(
                              text: 'Terms',
                              style: TextStyle(
                                  color: GodropColors.blue,
                                  fontWeight: FontWeight.w500),
                            ),
                            TextSpan(text: ' and '),
                            TextSpan(
                              text: 'Privacy Policy',
                              style: TextStyle(
                                  color: GodropColors.blue,
                                  fontWeight: FontWeight.w500),
                            ),
                            TextSpan(text: '.'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      GodropButton(
                        label: loading ? 'Sending...' : 'Send code →',
                        onTap: loading ? null : () => _sendCode(ctx),
                      ),
                      const SizedBox(height: 24),
                      Center(
                        child: GestureDetector(
                          onTap: () => ctx.go('/auth/login'),
                          child: RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                  fontSize: 14, color: GodropColors.slate),
                              children: [
                                TextSpan(text: 'Already have an account? '),
                                TextSpan(
                                  text: 'Sign in',
                                  style: TextStyle(
                                      color: GodropColors.blue,
                                      fontWeight: FontWeight.w600),
                                ),
                              ],
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
