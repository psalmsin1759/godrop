import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _controller = TextEditingController();
  PhoneNumber _number = PhoneNumber(isoCode: 'NG');
  bool _valid = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit(BuildContext ctx) {
    if (!_valid) return;
    final phone = _number.phoneNumber ?? '';
    ctx.read<AuthCubit>().requestOtp(phone);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthOtpSent) {
          ctx.go('/auth/otp', extra: state.phone);
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
            content: Text(state.message),
            backgroundColor: GodropColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(16),
          ));
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
                        child: const Icon(Icons.local_shipping_rounded,
                            color: GodropColors.white, size: 26),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Activate Your Account',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Enter the phone number you used when you applied to verify your identity and set up your password.',
                        style: TextStyle(
                          fontSize: 15,
                          color: GodropColors.slate,
                          height: 1.45,
                        ),
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
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: InternationalPhoneNumberInput(
                          onInputChanged: (PhoneNumber number) {
                            setState(() => _number = number);
                          },
                          onInputValidated: (bool valid) {
                            setState(() => _valid = valid);
                          },
                          initialValue: _number,
                          textFieldController: _controller,
                          formatInput: true,
                          keyboardType: const TextInputType.numberWithOptions(),
                          inputDecoration: const InputDecoration(
                            hintText: '080 0000 0000',
                            hintStyle: TextStyle(
                                color: GodropColors.mute, fontSize: 15),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 16),
                          ),
                          inputBorder: InputBorder.none,
                          spaceBetweenSelectorAndTextField: 0,
                          selectorConfig: const SelectorConfig(
                            selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
                            useEmoji: true,
                            leadingPadding: 0,
                          ),
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
                      const SizedBox(height: 28),
                      GodropButton(
                        label: loading ? 'Sending code...' : 'Send Code',
                        onTap: (_valid && !loading) ? () => _submit(ctx) : null,
                        isLoading: loading,
                      ),
                      const SizedBox(height: 20),
                      Center(
                        child: GestureDetector(
                          onTap: () => ctx.go('/auth/login'),
                          child: RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                  fontSize: 14, color: GodropColors.slate),
                              children: [
                                TextSpan(text: 'Already activated? '),
                                TextSpan(
                                    text: 'Sign in',
                                    style: TextStyle(
                                        color: GodropColors.blue,
                                        fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: GodropColors.card,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                                color: GodropColors.ink.withValues(alpha: 0.04),
                                blurRadius: 10,
                                offset: const Offset(0, 3)),
                          ],
                        ),
                        child: const Text(
                          'Only registered riders can log in.\nContact your dispatcher if you need access.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: GodropColors.mute,
                            height: 1.6,
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
