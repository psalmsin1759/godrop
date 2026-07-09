import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../app/theme.dart';

/// Card-style text field with soft border and shadow, matching the
/// customer app's auth inputs.
class GodropField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final String? label;
  final IconData? icon;
  final TextInputType keyboardType;
  final bool obscure;
  final Widget? suffix;
  final int maxLines;
  final bool enabled;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;

  const GodropField({
    super.key,
    required this.controller,
    required this.hint,
    this.label,
    this.icon,
    this.keyboardType = TextInputType.text,
    this.obscure = false,
    this.suffix,
    this.maxLines = 1,
    this.enabled = true,
    this.inputFormatters,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final field = Container(
      decoration: BoxDecoration(
        color: enabled ? GodropColors.card : GodropColors.divider,
        border: Border.all(color: GodropColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: GodropColors.ink.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscure,
        maxLines: maxLines,
        enabled: enabled,
        inputFormatters: inputFormatters,
        onChanged: onChanged,
        style: const TextStyle(fontSize: 15, color: GodropColors.ink),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 15),
          prefixIcon:
              icon != null ? Icon(icon, size: 20, color: GodropColors.mute) : null,
          suffixIcon: suffix,
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        ),
      ),
    );

    if (label == null) return field;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label!,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: GodropColors.slate,
          ),
        ),
        const SizedBox(height: 8),
        field,
      ],
    );
  }
}
