import 'dart:ui';
import 'package:flutter/material.dart';

/// Soft blurred gradient circles used behind auth/onboarding screens for depth.
class BackgroundBlobs extends StatelessWidget {
  final Color topColor;
  final Color bottomColor;
  const BackgroundBlobs({super.key, required this.topColor, required this.bottomColor});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(top: -90, right: -70, child: _Blob(color: topColor, size: 240)),
        Positioned(bottom: 100, left: -90, child: _Blob(color: bottomColor, size: 220)),
      ],
    );
  }
}

class _Blob extends StatelessWidget {
  final Color color;
  final double size;
  const _Blob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(shape: BoxShape.circle, color: color.withValues(alpha: 0.16)),
      ),
    );
  }
}
