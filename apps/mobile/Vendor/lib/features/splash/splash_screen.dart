import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/services/token_storage.dart';
import '../profile/bloc/session_cubit.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  );

  late final Animation<double> _logoScale = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.12), weight: 55),
    TweenSequenceItem(tween: Tween(begin: 1.12, end: 0.94), weight: 20),
    TweenSequenceItem(tween: Tween(begin: 0.94, end: 1.0), weight: 25),
  ]).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));

  late final Animation<double> _logoOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl,
          curve: const Interval(0.0, 0.4, curve: Curves.easeOut)));

  late final Animation<double> _wordOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl,
          curve: const Interval(0.45, 0.75, curve: Curves.easeOut)));

  late final Animation<double> _wordSlide = Tween(begin: 16.0, end: 0.0)
      .animate(CurvedAnimation(
          parent: _ctrl,
          curve: const Interval(0.45, 0.80, curve: Curves.easeOutCubic)));

  late final Animation<double> _tagOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl,
          curve: const Interval(0.60, 0.90, curve: Curves.easeOut)));

  @override
  void initState() {
    super.initState();
    _ctrl.forward();
    _route();
  }

  Future<void> _route() async {
    final hasToken = await TokenStorage.hasToken();
    await Future.delayed(const Duration(milliseconds: 1800));
    if (!mounted) return;
    if (hasToken) {
      context.read<SessionCubit>().load();
      context.go('/dashboard');
    } else {
      context.go('/auth/login');
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: _ctrl,
        builder: (_, __) => Container(
          width: double.infinity,
          height: double.infinity,
          decoration:
              const BoxDecoration(gradient: GodropColors.splashGradient),
          child: Stack(
            children: [
              Positioned(
                top: -60,
                right: -40,
                child: Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: GodropColors.orange.withValues(alpha: 0.18),
                  ),
                ),
              ),
              Positioned(
                bottom: -80,
                left: -60,
                child: Container(
                  width: 260,
                  height: 260,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: GodropColors.blue.withValues(alpha: 0.12),
                  ),
                ),
              ),
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Opacity(
                      opacity: _logoOpacity.value,
                      child: Transform.scale(
                        scale: _logoScale.value,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(22),
                          ),
                          padding: const EdgeInsets.all(14),
                          child: Image.asset('assets/images/logo.png'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Opacity(
                      opacity: _wordOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _wordSlide.value),
                        child: const Text(
                          'GoDrop Vendor',
                          style: TextStyle(
                            color: GodropColors.white,
                            fontSize: 30,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Opacity(
                      opacity: _tagOpacity.value,
                      child: Text(
                        'Run your store. Anywhere in Nigeria.',
                        style: TextStyle(
                          color: GodropColors.white.withValues(alpha: 0.75),
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
