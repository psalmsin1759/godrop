import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Section title with a small gradient accent bar, used to break up
/// long scrolling screens into clearly labeled groups.
class GodropSectionHeader extends StatelessWidget {
  final String title;
  const GodropSectionHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: BoxDecoration(
            gradient: GodropColors.blueGradient,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: GodropColors.ink,
              letterSpacing: -0.3,
            ),
          ),
        ),
      ],
    );
  }
}
