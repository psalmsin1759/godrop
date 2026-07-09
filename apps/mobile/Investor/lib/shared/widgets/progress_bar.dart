import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Rounded funding/lock progress bar on a raise3 track.
class InvestProgressBar extends StatelessWidget {
  const InvestProgressBar({
    super.key,
    required this.value,
    this.height = 6,
    this.gradient = InvestColors.cta,
    this.color,
  });

  /// 0–1.
  final double value;
  final double height;
  final Gradient gradient;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(height / 2),
      child: Container(
        height: height,
        color: InvestColors.raise3,
        child: FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: value.clamp(0, 1),
          child: Container(
            decoration: BoxDecoration(
              gradient: color == null ? gradient : null,
              color: color,
              borderRadius: BorderRadius.circular(height / 2),
            ),
          ),
        ),
      ),
    );
  }
}
