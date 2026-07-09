import 'package:flutter/material.dart';
import '../../app/theme.dart';

enum InvestButtonKind { primary, orange, dark, ghost, white }

/// Design-kit `IBtn` — gradient CTA pill, 54px tall (42 small), radius 15.
class InvestButton extends StatelessWidget {
  const InvestButton({
    super.key,
    required this.label,
    this.onPressed,
    this.kind = InvestButtonKind.primary,
    this.small = false,
    this.trailingIcon,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final InvestButtonKind kind;
  final bool small;
  final IconData? trailingIcon;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final disabled = onPressed == null || loading;

    Gradient? gradient;
    Color? bg;
    Color fg;
    List<BoxShadow>? shadow;
    Border? border;

    switch (kind) {
      case InvestButtonKind.primary:
        gradient = InvestColors.cta;
        fg = Colors.white;
        shadow = InvestColors.ctaShadow;
        break;
      case InvestButtonKind.orange:
        gradient = InvestColors.ctaOrange;
        fg = Colors.white;
        shadow = [
          BoxShadow(
            color: InvestColors.orangeDeep.withValues(alpha: 0.32),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ];
        break;
      case InvestButtonKind.dark:
        bg = InvestColors.raise3;
        fg = InvestColors.text;
        break;
      case InvestButtonKind.ghost:
        bg = Colors.transparent;
        fg = InvestColors.blueBright;
        border = Border.all(
            color: InvestColors.blueBright.withValues(alpha: 0.5), width: 1.5);
        break;
      case InvestButtonKind.white:
        bg = Colors.white;
        fg = const Color(0xFF0B1020);
        break;
    }

    return Opacity(
      opacity: disabled && !loading ? 0.4 : 1,
      child: GestureDetector(
        onTap: disabled ? null : onPressed,
        child: Container(
          height: small ? 42 : 54,
          padding: EdgeInsets.symmetric(horizontal: small ? 18 : 22),
          decoration: BoxDecoration(
            gradient: gradient,
            color: bg,
            border: border,
            borderRadius: BorderRadius.circular(small ? 12 : 15),
            boxShadow: disabled ? null : shadow,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2.4, color: fg),
                )
              else ...[
                Text(
                  label,
                  style: TextStyle(
                    color: fg,
                    fontSize: small ? 14 : 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.2,
                  ),
                ),
                if (trailingIcon != null) ...[
                  const SizedBox(width: 8),
                  Icon(trailingIcon, size: 18, color: fg),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}
