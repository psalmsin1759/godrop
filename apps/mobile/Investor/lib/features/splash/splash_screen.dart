import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/services/token_storage.dart';
import '../../shared/services/user_prefs.dart';
import '../../shared/widgets/godrop_mark.dart';

/// Screen 01 — blue gradient splash with glow orbs and the INVEST badge.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _route();
  }

  Future<void> _route() async {
    await Future.delayed(const Duration(milliseconds: 1400));
    final hasToken = await TokenStorage.hasToken();
    if (!mounted) return;
    if (hasToken) {
      context.go('/home');
    } else if (UserPrefs.seenOnboarding) {
      context.go('/auth/sign-in');
    } else {
      context.go('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: InvestColors.card),
        child: Stack(
          children: [
            Positioned(
              top: -80,
              right: -60,
              child: _glow(320, InvestColors.orange.withValues(alpha: 0.4)),
            ),
            Positioned(
              bottom: -100,
              left: -80,
              child: _glow(340, Colors.white.withValues(alpha: 0.14)),
            ),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const GoDropMark(size: 92, onGradient: true),
                  const SizedBox(height: 24),
                  const Text(
                    'GoDrop',
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -1,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.22),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'INVEST',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 3,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Own the vehicles that move Nigeria.\nEarn every month.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _glow(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(colors: [color, color.withValues(alpha: 0)]),
      ),
    );
  }
}
