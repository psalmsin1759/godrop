import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// GoDrop brand mark — a location-pin drop in a rounded gradient square,
/// with the INVEST wordmark variant used across auth screens.
class GoDropMark extends StatelessWidget {
  const GoDropMark({super.key, this.size = 44, this.onGradient = false});

  final double size;

  /// True when placed on the blue gradient (splash) — renders frosted.
  final bool onGradient;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: onGradient ? null : InvestColors.cta,
        color: onGradient ? Colors.white.withValues(alpha: 0.16) : null,
        borderRadius: BorderRadius.circular(size * 0.3),
        border: onGradient
            ? Border.all(color: Colors.white.withValues(alpha: 0.28))
            : null,
      ),
      child: Icon(Icons.place, size: size * 0.55, color: Colors.white),
    );
  }
}

class InvestWordmark extends StatelessWidget {
  const InvestWordmark({super.key, this.light = false});

  final bool light;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          'GoDrop',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.8,
            color: light ? Colors.white : InvestColors.text,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: light ? Colors.black.withValues(alpha: 0.22) : InvestColors.blue,
            borderRadius: BorderRadius.circular(6),
          ),
          child: const Text(
            'INVEST',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }
}
