import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/auth_cubit.dart';

/// Screen 06 — 6-digit OTP verify with resend countdown.
class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key, required this.phone});

  final String phone;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  Timer? _timer;
  int _secondsLeft = 30;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _startCountdown() {
    _timer?.cancel();
    setState(() => _secondsLeft = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft <= 0) {
        t.cancel();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  void _verify() {
    if (_controller.text.length != 6) return;
    context.read<AuthCubit>().verifyOtp(widget.phone, _controller.text);
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(22, 8, 22, 0),
                  child: InvestBackButton(),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(22),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: InvestColors.blueSoft,
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: const Icon(Icons.phone_iphone,
                              size: 30, color: InvestColors.blueBright),
                        ),
                        const SizedBox(height: 22),
                        const Text(
                          'Verify your number',
                          style: TextStyle(
                            fontSize: 27,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                            color: InvestColors.text,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text.rich(
                          TextSpan(
                            text: 'Enter the 6-digit code we sent to\n',
                            style: const TextStyle(
                                fontSize: 14, height: 1.5, color: InvestColors.sub),
                            children: [
                              TextSpan(
                                text: widget.phone,
                                style: const TextStyle(
                                  color: InvestColors.text,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 28),
                        _OtpBoxes(
                          controller: _controller,
                          focusNode: _focus,
                          onChanged: (v) {
                            setState(() {});
                            if (v.length == 6) _verify();
                          },
                        ),
                        const SizedBox(height: 22),
                        Center(
                          child: _secondsLeft > 0
                              ? Text.rich(
                                  TextSpan(
                                    text: 'Resend code in ',
                                    style: const TextStyle(
                                        fontSize: 13.5, color: InvestColors.sub),
                                    children: [
                                      TextSpan(
                                        text: '0:${_secondsLeft.toString().padLeft(2, '0')}',
                                        style: const TextStyle(
                                          color: InvestColors.text,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : GestureDetector(
                                  onTap: () {
                                    context.read<AuthCubit>().requestOtp(widget.phone);
                                    _startCountdown();
                                  },
                                  child: const Text(
                                    'Resend code',
                                    style: TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: InvestColors.blueBright,
                                    ),
                                  ),
                                ),
                        ),
                        const SizedBox(height: 26),
                        InvestButton(
                          label: 'Verify',
                          loading: loading,
                          onPressed:
                              _controller.text.length == 6 && !loading ? _verify : null,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Hidden text field driving six visual digit boxes.
class _OtpBoxes extends StatelessWidget {
  const _OtpBoxes({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Opacity(
          opacity: 0,
          child: TextField(
            controller: controller,
            focusNode: focusNode,
            keyboardType: TextInputType.number,
            maxLength: 6,
            autofocus: true,
            onChanged: onChanged,
          ),
        ),
        GestureDetector(
          onTap: () => focusNode.requestFocus(),
          child: Row(
            children: List.generate(6, (i) {
              final text = controller.text;
              final filled = i < text.length;
              final isCursor = i == text.length;
              return Expanded(
                child: Container(
                  height: 60,
                  margin: EdgeInsets.only(right: i < 5 ? 10 : 0),
                  decoration: BoxDecoration(
                    color: InvestColors.raise2,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: filled
                          ? InvestColors.blue
                          : (isCursor ? InvestColors.line2 : InvestColors.line),
                      width: 1.5,
                    ),
                    boxShadow: isCursor
                        ? [const BoxShadow(color: InvestColors.blueSoft, spreadRadius: 4)]
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    filled ? text[i] : '',
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: InvestColors.text,
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}
