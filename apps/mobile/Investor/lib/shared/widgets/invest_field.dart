import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Design-kit `Field` — label above a 52px rounded input on raise2.
class InvestField extends StatelessWidget {
  const InvestField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.icon,
    this.trailing,
    this.obscure = false,
    this.keyboardType,
    this.enabled = true,
    this.onChanged,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint;
  final IconData? icon;
  final Widget? trailing;
  final bool obscure;
  final TextInputType? keyboardType;
  final bool enabled;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: InvestColors.sub,
            ),
          ),
          const SizedBox(height: 7),
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: InvestColors.raise2,
              borderRadius: BorderRadius.circular(13),
              border: Border.all(color: InvestColors.line),
            ),
            child: Row(
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 18, color: InvestColors.mute),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: TextField(
                    controller: controller,
                    obscureText: obscure,
                    keyboardType: keyboardType,
                    enabled: enabled,
                    onChanged: onChanged,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.text,
                    ),
                    decoration: InputDecoration(
                      hintText: hint,
                      hintStyle: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                        color: InvestColors.mute,
                      ),
                      border: InputBorder.none,
                      isCollapsed: true,
                    ),
                  ),
                ),
                if (trailing != null) trailing!,
              ],
            ),
          ),
        ],
      ),
    );
  }
}
