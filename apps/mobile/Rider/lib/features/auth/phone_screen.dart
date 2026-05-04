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
          backgroundColor: GodropColors.white,
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: GodropColors.blueGradient,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.local_shipping_rounded,
                        color: GodropColors.white, size: 26),
                  ),
                  const SizedBox(height: 28),
                  const Text(
                    'Rider Login',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Enter your registered phone number to receive a login code.',
                    style: TextStyle(
                      fontSize: 15,
                      color: GodropColors.slate,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 36),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      border: Border.all(color: GodropColors.border, width: 1.5),
                      borderRadius: BorderRadius.circular(14),
                    ),
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
                        border: InputBorder.none,
                        hintStyle: TextStyle(color: GodropColors.mute),
                      ),
                      selectorConfig: const SelectorConfig(
                        selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
                        useEmoji: true,
                        leadingPadding: 0,
                      ),
                      textStyle: const TextStyle(
                        fontSize: 16,
                        color: GodropColors.ink,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                  GodropButton(
                    label: loading ? 'Sending code...' : 'Send Code',
                    onTap: (_valid && !loading) ? () => _submit(ctx) : null,
                    isLoading: loading,
                  ),
                  const SizedBox(height: 32),
                  Center(
                    child: Text(
                      'Only registered riders can log in.\nContact your dispatcher if you need access.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: GodropColors.mute,
                        height: 1.6,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
