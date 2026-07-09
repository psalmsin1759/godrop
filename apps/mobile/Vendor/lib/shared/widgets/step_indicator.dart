import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Multi-step progress bar used on the registration flow screens.
class StepIndicator extends StatelessWidget {
  final int totalSteps;
  final int currentStep;
  const StepIndicator({super.key, required this.totalSteps, required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(totalSteps, (i) {
        final active = i < currentStep;
        return Expanded(
          child: Container(
            height: 4,
            margin: EdgeInsets.only(right: i < totalSteps - 1 ? 6 : 0),
            decoration: BoxDecoration(
              gradient: active ? GodropColors.blueGradient : null,
              color: active ? null : GodropColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }
}
