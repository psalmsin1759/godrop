import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Selectable quick-amount / filter chip (₦250K · ₦500K · ₦1M …).
class SelectChip extends StatelessWidget {
  const SelectChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.pill = false,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  /// Fully-rounded filter style (catalog/transactions) vs radius-12 amount style.
  final bool pill;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: pill ? 16 : 14, vertical: 9),
        decoration: BoxDecoration(
          color: selected
              ? (pill ? InvestColors.blue : InvestColors.blueSoft)
              : InvestColors.raise2,
          borderRadius: BorderRadius.circular(pill ? 20 : 12),
          border: Border.all(
            color: selected ? InvestColors.blue : InvestColors.line,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: selected
                ? (pill ? Colors.white : InvestColors.blueBright)
                : InvestColors.sub,
          ),
        ),
      ),
    );
  }
}

/// Small tinted badge: ROI chips, status labels, FILLING FAST.
class SoftBadge extends StatelessWidget {
  const SoftBadge({
    super.key,
    required this.label,
    required this.color,
    this.background,
    this.icon,
    this.solid = false,
  });

  final String label;
  final Color color;
  final Color? background;
  final IconData? icon;
  final bool solid;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: solid ? color : (background ?? color.withValues(alpha: 0.16)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: solid ? Colors.white : color),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.3,
              color: solid ? Colors.white : color,
            ),
          ),
        ],
      ),
    );
  }
}

/// Progress dots for onboarding / promo carousels.
class Dots extends StatelessWidget {
  const Dots({super.key, required this.active, this.count = 3, this.onLight = true});

  final int active;
  final int count;
  final bool onLight;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(count, (i) {
        final on = i == active;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: on ? 20 : 7,
          height: 7,
          decoration: BoxDecoration(
            color: on
                ? (onLight ? InvestColors.blue : Colors.white)
                : (onLight
                    ? InvestColors.raise3
                    : Colors.white.withValues(alpha: 0.4)),
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}
