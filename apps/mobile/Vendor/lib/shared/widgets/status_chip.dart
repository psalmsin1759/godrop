import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Pill-shaped order-status badge with a status-specific tint.
class StatusChip extends StatelessWidget {
  final String status;
  const StatusChip({super.key, required this.status});

  static const Map<String, (Color, String)> _styles = {
    'PENDING': (GodropColors.orange, 'Pending'),
    'ACCEPTED': (GodropColors.blue, 'Accepted'),
    'PREPARING': (Color(0xFF8B5CF6), 'Preparing'),
    'READY_FOR_PICKUP': (Color(0xFF0EA5E9), 'Ready'),
    'PICKED_UP': (Color(0xFF0891B2), 'Picked up'),
    'IN_TRANSIT': (Color(0xFF0891B2), 'In transit'),
    'DELIVERED': (GodropColors.success, 'Delivered'),
    'CANCELLED': (GodropColors.error, 'Cancelled'),
    'FAILED': (GodropColors.error, 'Failed'),
  };

  @override
  Widget build(BuildContext context) {
    final (color, label) =
        _styles[status] ?? (GodropColors.mute, status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
