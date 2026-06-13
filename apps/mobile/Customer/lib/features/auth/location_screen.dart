import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/step_indicator.dart';

class LocationScreen extends StatefulWidget {
  const LocationScreen({super.key});

  @override
  State<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends State<LocationScreen> {
  bool _requesting = false;

  Future<void> _requestLocation() async {
    setState(() => _requesting = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) setState(() => _requesting = false);
        return;
      }
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied) {
        await Geolocator.openAppSettings();
        if (mounted) setState(() => _requesting = false);
        return;
      }
      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        if (mounted) context.go('/home');
        return;
      }
    } finally {
      if (mounted) setState(() => _requesting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Stack(
        children: [
          const BackgroundBlobs(
              topColor: GodropColors.blue, bottomColor: GodropColors.orange),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  const StepIndicator(totalSteps: 3, currentStep: 3),
                  const SizedBox(height: 12),
                  const Text(
                    'STEP 3 OF 3',
                    style: TextStyle(
                      fontSize: 11,
                      color: GodropColors.mute,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const Expanded(
                    child: Center(child: _LocationPinAnimation()),
                  ),
                  const Text(
                    'Enable location',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'We use your location to find nearby riders,\naccurate pickup points and faster deliveries.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 15, color: GodropColors.slate, height: 1.5),
                  ),
                  const SizedBox(height: 40),
                  GodropButton(
                    label:
                        _requesting ? 'Enabling...' : 'Allow location access',
                    onTap: _requesting ? () {} : () => _requestLocation(),
                  ),
                  const SizedBox(height: 14),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.go('/home'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 18, vertical: 10),
                        decoration: BoxDecoration(
                          color: GodropColors.card,
                          borderRadius: BorderRadius.circular(100),
                          boxShadow: [
                            BoxShadow(
                                color: GodropColors.ink.withValues(alpha: 0.04),
                                blurRadius: 8,
                                offset: const Offset(0, 2)),
                          ],
                        ),
                        child: const Text(
                          'Set manually',
                          style: TextStyle(
                              fontSize: 15,
                              color: GodropColors.slate,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LocationPinAnimation extends StatefulWidget {
  const _LocationPinAnimation();

  @override
  State<_LocationPinAnimation> createState() => _LocationPinAnimationState();
}

class _LocationPinAnimationState extends State<_LocationPinAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _controller =
        AnimationController(vsync: this, duration: const Duration(seconds: 2))
          ..repeat(reverse: true);
    _pulseAnim = Tween(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseAnim,
      builder: (_, __) => Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 160 * _pulseAnim.value,
            height: 160 * _pulseAnim.value,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: GodropColors.blue.withValues(alpha: 0.06),
            ),
          ),
          Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: GodropColors.blue.withValues(alpha: 0.15),
                width: 1.5,
              ),
              color: GodropColors.blue.withValues(alpha: 0.04),
            ),
          ),
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: GodropColors.blueGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                    color: GodropColors.blue.withValues(alpha: 0.35),
                    blurRadius: 18,
                    offset: const Offset(0, 8)),
              ],
            ),
            child: const Icon(Icons.location_on_rounded,
                color: GodropColors.white, size: 36),
          ),
        ],
      ),
    );
  }
}
