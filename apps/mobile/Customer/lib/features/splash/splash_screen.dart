import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/services/user_prefs.dart';

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

  // Logo: scale bounce in
  late final Animation<double> _logoScale = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.12), weight: 55),
    TweenSequenceItem(tween: Tween(begin: 1.12, end: 0.94), weight: 20),
    TweenSequenceItem(tween: Tween(begin: 0.94, end: 1.0), weight: 25),
  ]).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));

  late final Animation<double> _logoOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl, curve: const Interval(0.0, 0.4, curve: Curves.easeOut)));

  // Wordmark: fade + slide up after logo
  late final Animation<double> _wordOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl, curve: const Interval(0.45, 0.75, curve: Curves.easeOut)));

  late final Animation<double> _wordSlide = Tween(begin: 16.0, end: 0.0)
      .animate(CurvedAnimation(
          parent: _ctrl, curve: const Interval(0.45, 0.80, curve: Curves.easeOutCubic)));

  // Tagline: fade in later
  late final Animation<double> _tagOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl, curve: const Interval(0.60, 0.90, curve: Curves.easeOut)));

  // Cities: fade in last
  late final Animation<double> _citiesOpacity = Tween(begin: 0.0, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl, curve: const Interval(0.75, 1.0, curve: Curves.easeOut)));

  // Blob: scale in
  late final Animation<double> _blobScale = Tween(begin: 0.4, end: 1.0)
      .animate(CurvedAnimation(
          parent: _ctrl, curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic)));

  @override
  void initState() {
    super.initState();
    _ctrl.forward();
    Future.delayed(const Duration(milliseconds: 2400), () {
      if (mounted) {
        if (UserPrefs.isOnboarded) {
          context.go('/home');
        } else {
          context.go('/onboarding');
        }
      }
    });
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
          decoration: const BoxDecoration(gradient: GodropColors.splashGradient),
          child: Stack(
            children: [
              // Warm glow blob — scales in
              Positioned(
                top: -60,
                right: -40,
                child: Transform.scale(
                  scale: _blobScale.value,
                  child: Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: GodropColors.orange.withValues(alpha: 0.18),
                    ),
                  ),
                ),
              ),
              // Second soft blob bottom-left
              Positioned(
                bottom: -80,
                left: -60,
                child: Opacity(
                  opacity: _blobScale.value * 0.6,
                  child: Container(
                    width: 260,
                    height: 260,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: GodropColors.blue.withValues(alpha: 0.12),
                    ),
                  ),
                ),
              ),
              // Center content
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Logo with bounce scale
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
                          child: Image.asset(
                            'screenshots/logo/godrop-mark-512.png',
                            color: GodropColors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Wordmark
                    Opacity(
                      opacity: _wordOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _wordSlide.value),
                        child: const Text(
                          'GoDrop',
                          style: TextStyle(
                            color: GodropColors.white,
                            fontSize: 34,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Tagline
                    Opacity(
                      opacity: _tagOpacity.value,
                      child: Text(
                        'Move anything. Anywhere in Nigeria.',
                        style: TextStyle(
                          color: GodropColors.white.withValues(alpha: 0.75),
                          fontSize: 15,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Cities at bottom
              Positioned(
                bottom: 48,
                left: 0,
                right: 0,
                child: Opacity(
                  opacity: _citiesOpacity.value,
                  child: Center(
                    child: Text(
                      'LAGOS · ABUJA · PORT HARCOURT · IBADAN',
                      style: TextStyle(
                        color: GodropColors.white.withValues(alpha: 0.45),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
