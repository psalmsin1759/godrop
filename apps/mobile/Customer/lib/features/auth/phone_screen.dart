import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import '../../app/theme.dart';
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
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => ctx.go('/onboarding'),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: GodropColors.background,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.chevron_left_rounded, color: GodropColors.ink, size: 22),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: GodropColors.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(6),
                    child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
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
                    "We'll text you a code to verify. Standard SMS rates\napply.",
                    style: TextStyle(fontSize: 15, color: GodropColors.slate, height: 1.45),
                  ),
                  const SizedBox(height: 28),
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: GodropColors.blue, width: 1.5),
                      borderRadius: BorderRadius.circular(14),
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
                        hintStyle: TextStyle(color: GodropColors.mute, fontSize: 15),
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
                      style: TextStyle(fontSize: 12.5, color: GodropColors.mute),
                      children: [
                        TextSpan(text: 'By continuing you agree to our '),
                        TextSpan(
                          text: 'Terms',
                          style: TextStyle(color: GodropColors.blue, fontWeight: FontWeight.w500),
                        ),
                        TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(color: GodropColors.blue, fontWeight: FontWeight.w500),
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
                  const SizedBox(height: 28),
                  Row(children: [
                    Expanded(child: Divider(color: GodropColors.border)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'OR CONTINUE WITH',
                        style: TextStyle(
                          fontSize: 11,
                          color: GodropColors.mute,
                          letterSpacing: 0.8,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Expanded(child: Divider(color: GodropColors.border)),
                  ]),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      _SocialButton(label: 'Google', color: const Color(0xFFEA4335)),
                      const SizedBox(width: 12),
                      _SocialButton(label: 'Apple', color: GodropColors.ink),
                      const SizedBox(width: 12),
                      _SocialButton(label: 'Email', color: GodropColors.blue),
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

class _SocialButton extends StatelessWidget {
  final String label;
  final Color color;
  const _SocialButton({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          border: Border.all(color: GodropColors.border, width: 1.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 14)),
        ),
      ),
    );
  }
}
