import 'package:flutter/material.dart';
import '../../app/theme.dart';

class GodropButton extends StatefulWidget {
  final String label;
  final VoidCallback? onTap;
  final List<Color>? gradientColors;
  final Color? textColor;
  final IconData? icon;
  final bool isLoading;

  const GodropButton({
    super.key,
    required this.label,
    this.onTap,
    this.gradientColors,
    this.textColor,
    this.icon,
    this.isLoading = false,
  });

  @override
  State<GodropButton> createState() => _GodropButtonState();
}

class _GodropButtonState extends State<GodropButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 100),
    lowerBound: 0.94,
    upperBound: 1.0,
    value: 1.0,
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final disabled = widget.onTap == null || widget.isLoading;
    return GestureDetector(
      onTapDown: disabled ? null : (_) => _ctrl.reverse(),
      onTapUp: disabled ? null : (_) => _ctrl.forward(),
      onTapCancel: () => _ctrl.forward(),
      onTap: disabled ? null : widget.onTap,
      child: ScaleTransition(
        scale: _ctrl,
        child: AnimatedOpacity(
          opacity: disabled ? 0.55 : 1.0,
          duration: const Duration(milliseconds: 150),
          child: Container(
            width: double.infinity,
            height: 52,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: widget.gradientColors ??
                    GodropColors.blueGradient.colors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Center(
              child: widget.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(GodropColors.white),
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (widget.icon != null) ...[
                          Icon(widget.icon,
                              color: widget.textColor ?? GodropColors.white,
                              size: 18),
                          const SizedBox(width: 8),
                        ],
                        Text(
                          widget.label,
                          style: TextStyle(
                            color: widget.textColor ?? GodropColors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.1,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class GodropOutlineButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final Color? color;

  const GodropOutlineButton({
    super.key,
    required this.label,
    this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          border: Border.all(
              color: color ?? GodropColors.blue, width: 1.5),
          borderRadius: BorderRadius.circular(100),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: color ?? GodropColors.blue,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
