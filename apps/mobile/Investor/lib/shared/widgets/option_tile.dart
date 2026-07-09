import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Radio-select row used for payment methods and funding sources.
class OptionTile extends StatelessWidget {
  const OptionTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    this.onTap,
    this.disabled = false,
    this.subtitleColor,
  });

  final String title;
  final String subtitle;
  final Widget icon;
  final bool selected;
  final VoidCallback? onTap;
  final bool disabled;
  final Color? subtitleColor;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: disabled ? 0.55 : 1,
      child: GestureDetector(
        onTap: disabled ? null : onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: selected ? InvestColors.blueSoft : InvestColors.raise,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? InvestColors.blue : InvestColors.line,
              width: 1.5,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: InvestColors.raise3,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(child: icon),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: InvestColors.text,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: subtitleColor ?? InvestColors.sub,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: selected ? InvestColors.blue : Colors.transparent,
                  border: Border.all(
                    color: selected ? InvestColors.blue : InvestColors.line2,
                    width: 2,
                  ),
                ),
                child: selected
                    ? const Icon(Icons.check, size: 13, color: Colors.white)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
