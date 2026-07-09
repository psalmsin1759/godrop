import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

/// Design-kit `ITopBar` — 40px back square + title (+ optional subtitle).
class InvestTopBar extends StatelessWidget {
  const InvestTopBar({super.key, required this.title, this.subtitle, this.action});

  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
      child: Row(
        children: [
          const InvestBackButton(),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: InvestColors.text,
                    letterSpacing: -0.3,
                  ),
                ),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: Text(
                      subtitle!,
                      style: const TextStyle(fontSize: 12, color: InvestColors.sub),
                    ),
                  ),
              ],
            ),
          ),
          if (action != null) action!,
        ],
      ),
    );
  }
}

class InvestBackButton extends StatelessWidget {
  const InvestBackButton({super.key, this.onDark = false});

  /// When placed over imagery (asset detail hero), use a dark scrim square.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.pop(),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: onDark ? Colors.black.withValues(alpha: 0.5) : InvestColors.raise2,
          borderRadius: BorderRadius.circular(12),
          border: onDark ? null : Border.all(color: InvestColors.line),
        ),
        child: Icon(
          Icons.arrow_back_ios_new,
          size: 18,
          color: onDark ? Colors.white : InvestColors.text,
        ),
      ),
    );
  }
}
