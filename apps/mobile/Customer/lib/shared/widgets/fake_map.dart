import 'package:flutter/material.dart';
import '../../app/theme.dart';

class FakeMap extends StatelessWidget {
  final bool showRoute;
  final bool showRider;
  final double height;

  const FakeMap({super.key, this.showRoute = true, this.showRider = false, this.height = 260});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(painter: _MapPainter(showRoute: showRoute, showRider: showRider)),
    );
  }
}

class _MapPainter extends CustomPainter {
  final bool showRoute;
  final bool showRider;

  _MapPainter({required this.showRoute, required this.showRider});

  @override
  void paint(Canvas canvas, Size size) {
    // Background
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..color = const Color(0xFFEAE8E3));

    // Grid blocks (simulate city blocks)
    final roadPaint = Paint()..color = const Color(0xFFFFFFFF);
    final roadPaintMinor = Paint()..color = const Color(0xFFF5F3EE);

    // Horizontal roads
    for (double y = 0; y < size.height; y += 48) {
      canvas.drawRect(Rect.fromLTWH(0, y, size.width, 12), roadPaint);
    }
    for (double y = 24; y < size.height; y += 48) {
      canvas.drawRect(Rect.fromLTWH(0, y, size.width, 8), roadPaintMinor);
    }
    // Vertical roads
    for (double x = 0; x < size.width; x += 56) {
      canvas.drawRect(Rect.fromLTWH(x, 0, 12, size.height), roadPaint);
    }
    for (double x = 28; x < size.width; x += 56) {
      canvas.drawRect(Rect.fromLTWH(x, 0, 8, size.height), roadPaintMinor);
    }

    // Green area (park)
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.55, size.height * 0.55, 70, 50), const Radius.circular(6)),
      Paint()..color = const Color(0xFFB8E4B0),
    );
    // Blue area (water)
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.0, size.height * 0.72, 80, 40), const Radius.circular(4)),
      Paint()..color = const Color(0xFFBDD8F0),
    );

    if (showRoute) {
      // Pickup point A (orange)
      final aX = size.width * 0.22;
      final aY = size.height * 0.65;
      // Dropoff point B (blue)
      final bX = size.width * 0.75;
      final bY = size.height * 0.28;

      // Dashed route line
      final routePaint = Paint()
        ..color = GodropColors.blue
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke;

      final path = Path()
        ..moveTo(aX, aY)
        ..cubicTo(aX + 20, aY - 40, bX - 40, bY + 60, bX, bY);

      _drawDashedPath(canvas, path, routePaint);

      // Marker A
      _drawMarker(canvas, Offset(aX, aY), GodropColors.orange, 'A');
      // Marker B
      _drawMarker(canvas, Offset(bX, bY), GodropColors.blue, 'B');

      if (showRider) {
        // Rider icon midpoint
        final midX = (aX + bX) / 2 + 10;
        final midY = (aY + bY) / 2 - 10;
        _drawRiderIcon(canvas, Offset(midX, midY));
      }
    }
  }

  void _drawDashedPath(Canvas canvas, Path path, Paint paint) {
    final metrics = path.computeMetrics();
    for (final metric in metrics) {
      double dist = 0;
      while (dist < metric.length) {
        final seg = metric.extractPath(dist, dist + 8);
        canvas.drawPath(seg, paint);
        dist += 14;
      }
    }
  }

  void _drawMarker(Canvas canvas, Offset center, Color color, String label) {
    final circlePaint = Paint()..color = color;
    canvas.drawCircle(center, 16, Paint()..color = Colors.white..style = PaintingStyle.fill);
    canvas.drawCircle(center, 16, Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 2);
    canvas.drawCircle(center, 12, circlePaint);

    final tp = TextPainter(
      text: TextSpan(text: label, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, center - Offset(tp.width / 2, tp.height / 2));
  }

  void _drawRiderIcon(Canvas canvas, Offset center) {
    canvas.drawCircle(center, 20, Paint()..color = Colors.white..style = PaintingStyle.fill);
    canvas.drawCircle(center, 20, Paint()..color = GodropColors.blue.withOpacity(0.3)..style = PaintingStyle.stroke..strokeWidth = 1.5);

    final iconPainter = TextPainter(
      text: const TextSpan(text: '🛵', style: TextStyle(fontSize: 16)),
      textDirection: TextDirection.ltr,
    )..layout();
    iconPainter.paint(canvas, center - Offset(iconPainter.width / 2, iconPainter.height / 2));
  }

  @override
  bool shouldRepaint(_MapPainter old) => false;
}
