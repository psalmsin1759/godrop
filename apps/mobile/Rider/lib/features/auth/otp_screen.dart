import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

const _maxRetriesBeforeSupport = 3;

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
  int _resendCount = 0;
  String? _supportPhone;

  @override
  void initState() {
    super.initState();
    _startTimer();
    _loadSupportPhone();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) FocusScope.of(context).requestFocus(_focusNodes[0]);
    });
  }

  Future<void> _loadSupportPhone() async {
    try {
      final res = await DioClient.instance.get('/config');
      final data = res.data as Map<String, dynamic>;
      final raw = data['data'] as Map<String, dynamic>? ?? data;
      final phone = raw['customerServicePhone'] as String?;
      if (mounted && phone != null && phone.isNotEmpty) {
        setState(() => _supportPhone = phone);
      }
    } catch (_) {}
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
    setState(() {
      _seconds = 60;
      _resendCount++;
    });
    _startTimer();
    FocusScope.of(context).requestFocus(_focusNodes[0]);
    ctx.read<AuthCubit>().requestOtp(widget.phone);
    if (_resendCount == _maxRetriesBeforeSupport) {
      _showCallSupportSheet(ctx);
    }
  }

  void _showCallSupportSheet(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CallSupportSheet(
        phone: widget.phone,
        supportPhone: _supportPhone,
      ),
    );
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
          ctx.go('/jobs');
        } else if (state is AuthPasswordSetupRequired) {
          ctx.go('/auth/create-password', extra: state.riderId);
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
                      const SizedBox(height: 12),
                      GodropBackButton(onTap: () => ctx.go('/auth/phone')),
                      const SizedBox(height: 32),
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
                        child: const Icon(Icons.sms_rounded,
                            color: GodropColors.white, size: 24),
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
                          style: const TextStyle(
                              fontSize: 15, color: GodropColors.slate),
                          children: [
                            TextSpan(
                                text:
                                    'We sent a 6-digit code to ${widget.phone}.\n'),
                            WidgetSpan(
                              child: GestureDetector(
                                onTap: () => ctx.go('/auth/phone'),
                                child: const Text(
                                  'Change',
                                  style: TextStyle(
                                      color: GodropColors.blue,
                                      fontWeight: FontWeight.w500,
                                      fontSize: 15),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      Row(
                        children: List.generate(
                            6,
                            (i) => Expanded(
                                  child: Padding(
                                    padding:
                                        EdgeInsets.only(right: i < 5 ? 10 : 0),
                                    child: AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 150),
                                      height: 56,
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                          color: _codes[i].text.isNotEmpty
                                              ? GodropColors.blue
                                              : GodropColors.border,
                                          width: 1.5,
                                        ),
                                        borderRadius: BorderRadius.circular(14),
                                        color: _codes[i].text.isNotEmpty
                                            ? GodropColors.blue
                                                .withValues(alpha: 0.05)
                                            : GodropColors.card,
                                        boxShadow: [
                                          BoxShadow(
                                            color: (_codes[i].text.isNotEmpty
                                                    ? GodropColors.blue
                                                    : GodropColors.ink)
                                                .withValues(
                                                    alpha: _codes[i]
                                                            .text
                                                            .isNotEmpty
                                                        ? 0.12
                                                        : 0.04),
                                            blurRadius: 10,
                                            offset: const Offset(0, 3),
                                          ),
                                        ],
                                      ),
                                      child: Center(
                                        child: Focus(
                                          onKeyEvent: (node, event) {
                                            if (event is KeyDownEvent &&
                                                event.logicalKey ==
                                                    LogicalKeyboardKey
                                                        .backspace &&
                                                _codes[i].text.isEmpty &&
                                                i > 0) {
                                              FocusScope.of(context)
                                                  .requestFocus(
                                                      _focusNodes[i - 1]);
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
                                            inputFormatters: [
                                              FilteringTextInputFormatter
                                                  .digitsOnly
                                            ],
                                            decoration: const InputDecoration(
                                              counterText: '',
                                              border: InputBorder.none,
                                            ),
                                            onChanged: (v) {
                                              setState(() {});
                                              if (v.isNotEmpty && i < 5) {
                                                FocusScope.of(context)
                                                    .requestFocus(
                                                        _focusNodes[i + 1]);
                                              } else if (v.isEmpty && i > 0) {
                                                FocusScope.of(context)
                                                    .requestFocus(
                                                        _focusNodes[i - 1]);
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
                            ? Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 10),
                                decoration: BoxDecoration(
                                  color: GodropColors.card,
                                  borderRadius: BorderRadius.circular(100),
                                  boxShadow: [
                                    BoxShadow(
                                        color: GodropColors.ink
                                            .withValues(alpha: 0.04),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2)),
                                  ],
                                ),
                                child: RichText(
                                  text: TextSpan(
                                    style: const TextStyle(
                                        fontSize: 14,
                                        color: GodropColors.slate),
                                    children: [
                                      const TextSpan(
                                          text:
                                              "Didn't get a code? Resend in "),
                                      TextSpan(
                                        text:
                                            '0:${_seconds.toString().padLeft(2, '0')}',
                                        style: const TextStyle(
                                          color: GodropColors.blue,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            : GestureDetector(
                                onTap: loading ? null : () => _resend(ctx),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 10),
                                  decoration: BoxDecoration(
                                    color: GodropColors.blue
                                        .withValues(alpha: 0.06),
                                    borderRadius: BorderRadius.circular(100),
                                  ),
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
                      ),
                      if (_resendCount >= _maxRetriesBeforeSupport) ...[
                        const SizedBox(height: 16),
                        _CallSupportBanner(
                          onTap: () => _showCallSupportSheet(ctx),
                        ),
                      ],
                      const SizedBox(height: 32),
                      GodropButton(
                        label: loading ? 'Verifying...' : 'Verify',
                        onTap: (loading || _otp.length < 6)
                            ? null
                            : () => _verify(ctx),
                        isLoading: loading,
                      ),
                      const SizedBox(height: 24),
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

class _CallSupportBanner extends StatelessWidget {
  final VoidCallback onTap;
  const _CallSupportBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.orange.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: GodropColors.orange.withValues(alpha: 0.3)),
        ),
        child: const Row(
          children: [
            Icon(Icons.support_agent_rounded,
                color: GodropColors.orange, size: 22),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                "Still no code? Call customer service to verify manually.",
                style: TextStyle(
                    fontSize: 13,
                    color: GodropColors.ink,
                    fontWeight: FontWeight.w500),
              ),
            ),
            Icon(Icons.chevron_right_rounded,
                color: GodropColors.orange, size: 20),
          ],
        ),
      ),
    );
  }
}

class _CallSupportSheet extends StatelessWidget {
  final String phone;
  final String? supportPhone;
  const _CallSupportSheet({required this.phone, required this.supportPhone});

  Future<void> _call(String number) async {
    final uri = Uri(scheme: 'tel', path: number);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
          24, 24, 24, MediaQuery.of(context).padding.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: GodropColors.orange.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.support_agent_rounded,
                color: GodropColors.orange, size: 26),
          ),
          const SizedBox(height: 16),
          const Text(
            "Still haven't received your code?",
            style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w700,
                color: GodropColors.ink),
          ),
          const SizedBox(height: 8),
          const Text(
            'Our customer service team can verify your number manually over the phone.',
            style: TextStyle(fontSize: 14, color: GodropColors.slate, height: 1.4),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: GodropColors.orange.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: GodropColors.orange.withValues(alpha: 0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_rounded, color: GodropColors.orange, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(
                          fontSize: 13, color: GodropColors.ink, height: 1.4),
                      children: [
                        const TextSpan(
                            text: 'Important: ',
                            style: TextStyle(fontWeight: FontWeight.w700)),
                        const TextSpan(
                            text: 'You must call from '),
                        TextSpan(
                          text: phone,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: GodropColors.orange),
                        ),
                        const TextSpan(
                            text:
                                ' — the number you\'re verifying — so we can confirm it\'s you.'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          if (supportPhone != null && supportPhone!.isNotEmpty)
            GodropButton(
              label: 'Call $supportPhone',
              icon: Icons.call_rounded,
              onTap: () => _call(supportPhone!),
            )
          else
            const Text(
              'Customer service number is currently unavailable. Please try resending your code again shortly.',
              style: TextStyle(fontSize: 13, color: GodropColors.mute),
            ),
          const SizedBox(height: 12),
          Center(
            child: TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Keep waiting',
                  style: TextStyle(color: GodropColors.slate)),
            ),
          ),
        ],
      ),
    );
  }
}
