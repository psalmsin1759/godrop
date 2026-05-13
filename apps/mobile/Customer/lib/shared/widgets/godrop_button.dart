import 'package:flutter/material.dart';
import '../../app/theme.dart';

class GodropButton extends StatefulWidget {
  final String label;
  final VoidCallback? onTap;
  final bool fullWidth;
  final Color? color;
  final Color? textColor;
  final IconData? trailingIcon;
  final double height;
  final double fontSize;

  const GodropButton({
    super.key,
    required this.label,
    this.onTap,
    this.fullWidth = true,
    this.color,
    this.textColor,
    this.trailingIcon,
    this.height = 54,
    this.fontSize = 16,
  });

  @override
  State<GodropButton> createState() => _GodropButtonState();
}

class _GodropButtonState extends State<GodropButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 90),
    reverseDuration: const Duration(milliseconds: 220),
  );
  late final Animation<double> _scale = Tween(begin: 1.0, end: 0.955).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _press() {
    if (widget.onTap != null) _ctrl.forward();
  }

  void _release() => _ctrl.reverse();

  @override
  Widget build(BuildContext context) {
    final fg = widget.textColor ?? GodropColors.white;
    final useGradient = widget.color == null;

    return ScaleTransition(
      scale: _scale,
      child: SizedBox(
        width: widget.fullWidth ? double.infinity : null,
        height: widget.height,
        child: GestureDetector(
          onTapDown: (_) => _press(),
          onTapUp: (_) => _release(),
          onTapCancel: _release,
          onTap: widget.onTap,
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(100),
            child: InkWell(
              onTap: null, // tap handled by GestureDetector above
              borderRadius: BorderRadius.circular(100),
              splashColor: Colors.white.withValues(alpha: 0.15),
              highlightColor: Colors.transparent,
              child: Ink(
                decoration: BoxDecoration(
                  gradient: useGradient ? GodropColors.blueGradient : null,
                  color: useGradient ? null : widget.color,
                  borderRadius: BorderRadius.circular(100),
                  boxShadow: useGradient
                      ? [
                          BoxShadow(
                            color: GodropColors.blue.withValues(alpha: 0.35),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          )
                        ]
                      : null,
                ),
                child: Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          widget.label,
                          style: TextStyle(
                            color: fg,
                            fontSize: widget.fontSize,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -0.2,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                      if (widget.trailingIcon != null) ...[
                        const SizedBox(width: 6),
                        Icon(widget.trailingIcon, color: fg, size: 18),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class GodropOutlineButton extends StatefulWidget {
  final String label;
  final VoidCallback? onTap;
  final bool fullWidth;

  const GodropOutlineButton({
    super.key,
    required this.label,
    this.onTap,
    this.fullWidth = true,
  });

  @override
  State<GodropOutlineButton> createState() => _GodropOutlineButtonState();
}

class _GodropOutlineButtonState extends State<GodropOutlineButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 90),
    reverseDuration: const Duration(milliseconds: 220),
  );
  late final Animation<double> _scale = Tween(begin: 1.0, end: 0.96).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: SizedBox(
        width: widget.fullWidth ? double.infinity : null,
        height: 54,
        child: GestureDetector(
          onTapDown: (_) => _ctrl.forward(),
          onTapUp: (_) => _ctrl.reverse(),
          onTapCancel: _ctrl.reverse,
          onTap: widget.onTap,
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            child: InkWell(
              onTap: null,
              borderRadius: BorderRadius.circular(14),
              splashColor: GodropColors.blue.withValues(alpha: 0.06),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: GodropColors.border, width: 1.5),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(
                    widget.label,
                    style: const TextStyle(
                      color: GodropColors.ink,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
