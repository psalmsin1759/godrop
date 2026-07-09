import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../app/theme.dart';

/// Design-kit numeric keypad — 3×4 grid: 1-9, '.', 0, backspace.
class AmountKeypad extends StatelessWidget {
  const AmountKeypad({super.key, required this.onKey, required this.onBackspace});

  final ValueChanged<String> onKey;
  final VoidCallback onBackspace;

  @override
  Widget build(BuildContext context) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 2.3,
      mainAxisSpacing: 6,
      crossAxisSpacing: 6,
      children: keys.map((k) {
        return InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            HapticFeedback.lightImpact();
            if (k == '⌫') {
              onBackspace();
            } else {
              onKey(k);
            }
          },
          child: Center(
            child: k == '⌫'
                ? const Icon(Icons.backspace_outlined,
                    size: 22, color: InvestColors.text)
                : Text(
                    k,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: InvestColors.text,
                    ),
                  ),
          ),
        );
      }).toList(),
    );
  }
}
