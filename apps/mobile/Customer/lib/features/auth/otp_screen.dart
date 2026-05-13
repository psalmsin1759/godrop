import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _codes = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());
  int _seconds = 60;

  @override
  void initState() {
    super.initState();
    _startTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FocusScope.of(context).requestFocus(_focusNodes[0]);
    });
  }

  void _startTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      if (_seconds > 0) setState(() => _seconds--);
      return _seconds > 0;
    });
  }

  void _resend(BuildContext ctx) {
    for (final c in _codes) c.clear();
    setState(() => _seconds = 60);
    _startTimer();
    FocusScope.of(context).requestFocus(_focusNodes[0]);
    ctx.read<AuthCubit>().requestOtp(widget.phone);
  }

  String get _otp => _codes.map((c) => c.text).join();

  void _verify(BuildContext ctx) {
    final otp = _otp;
    if (otp.length < 6) return;
    ctx.read<AuthCubit>().verifyOtp(widget.phone, otp);
  }

  @override
  void dispose() {
    for (final c in _codes) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthAuthenticated) {
          ctx.go('/home');
        } else if (state is AuthOtpVerified) {
          ctx.go('/auth/profile');
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
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => ctx.go('/auth/phone'),
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
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: GodropColors.blue.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.phone_outlined, color: GodropColors.blue, size: 24),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Enter the code',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 8),
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(fontSize: 15, color: GodropColors.slate),
                      children: [
                        TextSpan(text: 'We sent a 6-digit code to ${widget.phone}.\n'),
                        WidgetSpan(
                          child: GestureDetector(
                            onTap: () => ctx.go('/auth/phone'),
                            child: const Text(
                              'Change',
                              style: TextStyle(color: GodropColors.blue, fontWeight: FontWeight.w500, fontSize: 15),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    children: List.generate(6, (i) => Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(right: i < 5 ? 10 : 0),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          height: 56,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: _codes[i].text.isNotEmpty ? GodropColors.blue : GodropColors.border,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            color: _codes[i].text.isNotEmpty
                                ? GodropColors.blue.withOpacity(0.04)
                                : GodropColors.white,
                          ),
                          child: Center(
                            child: Focus(
                              onKeyEvent: (node, event) {
                                if (event is KeyDownEvent &&
                                    event.logicalKey == LogicalKeyboardKey.backspace &&
                                    _codes[i].text.isEmpty &&
                                    i > 0) {
                                  FocusScope.of(context).requestFocus(_focusNodes[i - 1]);
                                  return KeyEventResult.handled;
                                }
                                return KeyEventResult.ignored;
                              },
                              child: TextField(
                                controller: _codes[i],
                                focusNode: _focusNodes[i],
                                keyboardType: TextInputType.number,
                                maxLength: 1,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w600,
                                  color: GodropColors.ink,
                                ),
                                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                decoration: const InputDecoration(
                                  counterText: '',
                                  border: InputBorder.none,
                                ),
                                onChanged: (v) {
                                  setState(() {});
                                  if (v.isNotEmpty && i < 5) {
                                    FocusScope.of(context).requestFocus(_focusNodes[i + 1]);
                                  } else if (v.isEmpty && i > 0) {
                                    FocusScope.of(context).requestFocus(_focusNodes[i - 1]);
                                  }
                                },
                              ),
                            ),
                          ),
                        ),
                      ),
                    )),
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: _seconds > 0
                        ? RichText(
                            text: TextSpan(
                              style: const TextStyle(fontSize: 14, color: GodropColors.slate),
                              children: [
                                const TextSpan(text: "Didn't get a code? Resend in "),
                                TextSpan(
                                  text: '0:${_seconds.toString().padLeft(2, '0')}',
                                  style: const TextStyle(
                                    color: GodropColors.blue,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : GestureDetector(
                            onTap: loading ? null : () => _resend(ctx),
                            child: const Text(
                              'Resend code',
                              style: TextStyle(
                                fontSize: 14,
                                color: GodropColors.blue,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                  ),
                  const SizedBox(height: 32),
                  GodropButton(
                    label: loading ? 'Verifying...' : 'Verify',
                    onTap: loading ? null : () => _verify(ctx),
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
