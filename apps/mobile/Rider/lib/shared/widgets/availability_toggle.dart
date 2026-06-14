import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Online/offline availability switch shared between the Profile and Jobs
/// screens.
class AvailabilityToggle extends StatelessWidget {
  final bool isAvailable;
  final bool loading;
  final VoidCallback onToggle;

  const AvailabilityToggle({
    super.key,
    required this.isAvailable,
    required this.loading,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: loading ? null : onToggle,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isAvailable
              ? GodropColors.success.withValues(alpha: 0.1)
              : GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isAvailable
                ? GodropColors.success.withValues(alpha: 0.4)
                : GodropColors.border,
          ),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Icon(
              isAvailable
                  ? Icons.radio_button_on_rounded
                  : Icons.radio_button_off_rounded,
              color: isAvailable ? GodropColors.success : GodropColors.mute,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isAvailable
                    ? 'You are Online — receiving orders'
                    : 'You are Offline — go online to receive orders',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color:
                      isAvailable ? GodropColors.success : GodropColors.mute,
                ),
              ),
            ),
            if (loading)
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: GodropColors.blue),
              )
            else
              Switch(
                value: isAvailable,
                onChanged: (_) => onToggle(),
                activeTrackColor: GodropColors.success,
              ),
          ],
        ),
      ),
    );
  }
}
