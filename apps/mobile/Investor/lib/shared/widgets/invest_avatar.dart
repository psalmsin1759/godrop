import 'package:flutter/material.dart';

/// Design-kit `InvestAvatar` — warm gradient rounded-square avatar.
/// Shows the investor's initials over the sun gradient.
class InvestAvatar extends StatelessWidget {
  const InvestAvatar({
    super.key,
    this.size = 48,
    this.ring = false,
    this.initials = '',
  });

  final double size;
  final bool ring;
  final String initials;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFF5C542), Color(0xFFEBA92E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(size * 0.3),
        border: ring
            ? Border.all(color: Colors.white.withValues(alpha: 0.85), width: 3)
            : null,
        boxShadow: ring
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      alignment: Alignment.center,
      child: initials.isEmpty
          ? Icon(Icons.person, size: size * 0.5, color: const Color(0xFF8A5D10))
          : Text(
              initials,
              style: TextStyle(
                fontSize: size * 0.36,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF6B4A0E),
              ),
            ),
    );
  }
}
