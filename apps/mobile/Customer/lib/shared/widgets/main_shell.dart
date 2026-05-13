import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell shell;
  const MainShell({super.key, required this.shell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: _GodropBottomNav(
        currentIndex: shell.currentIndex,
        onTap: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
      ),
    );
  }
}

class _GodropBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  const _GodropBottomNav({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GodropColors.white,
        border: Border(top: BorderSide(color: GodropColors.border, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            children: [
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home_rounded,
                label: 'Home',
                selected: currentIndex == 0,
                onTap: () => onTap(0),
              ),
              _NavItem(
                icon: Icons.receipt_long_outlined,
                activeIcon: Icons.receipt_long_rounded,
                label: 'Orders',
                selected: currentIndex == 1,
                onTap: () => onTap(1),
              ),
              _CenterNavButton(onTap: () {}),
              _NavItem(
                icon: Icons.account_balance_wallet_outlined,
                activeIcon: Icons.account_balance_wallet_rounded,
                label: 'Wallet',
                selected: currentIndex == 2,
                onTap: () => onTap(2),
              ),
              _NavItem(
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profile',
                selected: currentIndex == 3,
                onTap: () => onTap(3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatefulWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  State<_NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<_NavItem> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 380),
  );

  // Bounce: 1.0 → 1.28 → 0.94 → 1.0
  late final Animation<double> _bounce = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.28), weight: 35),
    TweenSequenceItem(tween: Tween(begin: 1.28, end: 0.94), weight: 30),
    TweenSequenceItem(tween: Tween(begin: 0.94, end: 1.0), weight: 35),
  ]).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));

  @override
  void didUpdateWidget(_NavItem old) {
    super.didUpdateWidget(old);
    if (widget.selected && !old.selected) {
      _ctrl.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.selected ? GodropColors.blue : GodropColors.mute;

    return Expanded(
      child: GestureDetector(
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ScaleTransition(
              scale: _bounce,
              child: Icon(
                widget.selected ? widget.activeIcon : widget.icon,
                color: color,
                size: 22,
              ),
            ),
            const SizedBox(height: 2),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: TextStyle(
                fontSize: 10,
                fontWeight: widget.selected ? FontWeight.w600 : FontWeight.w400,
                color: color,
              ),
              child: Text(widget.label),
            ),
            const SizedBox(height: 2),
            // Animated selection dot
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutCubic,
              width: widget.selected ? 16 : 0,
              height: 3,
              decoration: BoxDecoration(
                color: GodropColors.blue,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CenterNavButton extends StatefulWidget {
  final VoidCallback onTap;
  const _CenterNavButton({required this.onTap});

  @override
  State<_CenterNavButton> createState() => _CenterNavButtonState();
}

class _CenterNavButtonState extends State<_CenterNavButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 110),
    reverseDuration: const Duration(milliseconds: 200),
  );
  late final Animation<double> _scale = Tween(begin: 1.0, end: 0.90).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Center(
        child: GestureDetector(
          onTapDown: (_) => _ctrl.forward(),
          onTapUp: (_) => _ctrl.reverse(),
          onTapCancel: _ctrl.reverse,
          onTap: widget.onTap,
          child: ScaleTransition(
            scale: _scale,
            child: Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: GodropColors.blueGradient,
              ),
              child: Center(
                child: Image.asset(
                  'screenshots/logo/godrop-mark-512.png',
                  width: 26,
                  height: 26,
                  color: GodropColors.white,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
