import 'package:flutter/material.dart';
import '../../app/theme.dart';

/// Design-kit `VehicleTile` — dark gradient tile with a colored vehicle glyph.
/// Tiles stay dark in both themes (they read as imagery, not surface).
class VehicleTile extends StatelessWidget {
  const VehicleTile({
    super.key,
    required this.vehicleClass,
    this.height = 92,
    this.radius = 14,
    this.label,
  });

  final String vehicleClass; // KEKE | SHUTTLE | RIDE_CAR | BIKE
  final double height;
  final double radius;
  final String? label;

  static const _palettes = {
    'KEKE': [Color(0xFF3A2E12), Color(0xFF1E1808)],
    'SHUTTLE': [Color(0xFF12233F), Color(0xFF0A1526)],
    'RIDE_CAR': [Color(0xFF0E2E22), Color(0xFF081A13)],
    'BIKE': [Color(0xFF2A1330), Color(0xFF160A1A)],
  };

  static const _glyphColors = {
    'KEKE': InvestColors.gold,
    'SHUTTLE': Color(0xFF6FA0FF),
    'RIDE_CAR': InvestColors.green,
    'BIKE': Color(0xFFC77BFF),
  };

  static const _icons = {
    'KEKE': Icons.electric_rickshaw,
    'SHUTTLE': Icons.directions_bus_filled,
    'RIDE_CAR': Icons.directions_car_filled,
    'BIKE': Icons.two_wheeler,
  };

  /// Icon for inline use (activity rows, tabs).
  static IconData iconFor(String vehicleClass) =>
      _icons[vehicleClass] ?? Icons.electric_rickshaw;

  static Color glyphColorFor(String vehicleClass) =>
      _glyphColors[vehicleClass] ?? InvestColors.gold;

  @override
  Widget build(BuildContext context) {
    final colors = _palettes[vehicleClass] ?? _palettes['KEKE']!;
    final glyph = _glyphColors[vehicleClass] ?? InvestColors.gold;
    final icon = _icons[vehicleClass] ?? Icons.electric_rickshaw;
    return Container(
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // ground line
          Positioned(
            left: 0,
            right: 0,
            bottom: height * 0.22,
            child: Container(height: 1, color: Colors.white.withValues(alpha: 0.08)),
          ),
          Center(
            child: Icon(icon, size: (height * 0.6).clamp(18, 64), color: glyph),
          ),
          if (label != null)
            Positioned(
              top: 8,
              left: 8,
              child: Text(
                label!,
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 0.4,
                  fontFamily: 'monospace',
                  color: Colors.white.withValues(alpha: 0.4),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
