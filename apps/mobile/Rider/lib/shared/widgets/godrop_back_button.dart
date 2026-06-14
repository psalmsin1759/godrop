import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Rounded card-style back button with a soft shadow, used across auth screens.
class GodropBackButton extends StatelessWidget {
  final VoidCallback onTap;
  const GodropBackButton({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(color: GodropColors.ink.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, 3)),
          ],
        ),
        child: const Icon(Icons.chevron_left_rounded, color: GodropColors.ink, size: 22),
      ),
    );
  }
}
