import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../features/food/bloc/cart_cubit.dart';
import '../../features/food/bloc/cart_state.dart';
import '../services/disputes_unread_service.dart';

class MainShell extends StatefulWidget {
  final StatefulNavigationShell shell;
  const MainShell({super.key, required this.shell});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    DisputesUnreadService.refresh();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) DisputesUnreadService.refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: widget.shell,
      bottomNavigationBar: _GodropBottomNav(
        currentIndex: widget.shell.currentIndex,
        onTap: (i) => widget.shell
            .goBranch(i, initialLocation: i == widget.shell.currentIndex),
      ),
    );
  }
}

class _NavItemData {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool showCartBadge;
  final bool showDisputesBadge;
  const _NavItemData(this.icon, this.activeIcon, this.label,
      {this.showCartBadge = false, this.showDisputesBadge = false});
}

const _kNavItems = [
  _NavItemData(Icons.home_outlined, Icons.home_rounded, 'Home'),
  _NavItemData(
      Icons.receipt_long_outlined, Icons.receipt_long_rounded, 'Orders'),
  _NavItemData(Icons.shopping_cart_outlined, Icons.shopping_cart_rounded,
      'Cart', showCartBadge: true),
  _NavItemData(Icons.account_balance_wallet_outlined,
      Icons.account_balance_wallet_rounded, 'Wallet'),
  _NavItemData(Icons.person_outline_rounded, Icons.person_rounded, 'Profile',
      showDisputesBadge: true),
];

class _GodropBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  const _GodropBottomNav({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(16, 0, 16, bottomPad > 0 ? bottomPad : 12),
      child: Container(
        height: 66,
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: GodropColors.ink.withValues(alpha: 0.10),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: List.generate(_kNavItems.length, (i) {
            return _NavItem(
              data: _kNavItems[i],
              selected: currentIndex == i,
              onTap: () => onTap(i),
            );
          }),
        ),
      ),
    );
  }
}

class _NavItem extends StatefulWidget {
  final _NavItemData data;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({
    required this.data,
    required this.selected,
    required this.onTap,
  });

  @override
  State<_NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<_NavItem>
    with SingleTickerProviderStateMixin {
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
    final selected = widget.selected;
    final color = selected ? GodropColors.blue : GodropColors.mute;

    return Expanded(
      child: GestureDetector(
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: Center(
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 280),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: selected
                    ? GodropColors.blue.withValues(alpha: 0.10)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ScaleTransition(
                    scale: _bounce,
                    child: widget.data.showCartBadge
                        ? _CartIcon(
                            icon: selected
                                ? widget.data.activeIcon
                                : widget.data.icon,
                            color: color,
                          )
                        : widget.data.showDisputesBadge
                            ? _DisputesBadgeIcon(
                                icon: selected
                                    ? widget.data.activeIcon
                                    : widget.data.icon,
                                color: color,
                              )
                            : Icon(
                                selected
                                    ? widget.data.activeIcon
                                    : widget.data.icon,
                                color: color,
                                size: 22,
                              ),
                  ),
                  AnimatedSize(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    child: selected
                        ? Padding(
                            padding: const EdgeInsets.only(left: 6),
                            child: Text(
                              widget.data.label,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: GodropColors.blue,
                              ),
                            ),
                          )
                        : const SizedBox(width: 0, height: 0),
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

class _DisputesBadgeIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  const _DisputesBadgeIcon({required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: DisputesUnreadService.count,
      builder: (ctx, count, __) {
        return Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(icon, color: color, size: 22),
            if (count > 0)
              Positioned(
                top: -4,
                right: -6,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  constraints: const BoxConstraints(minWidth: 16),
                  decoration: BoxDecoration(
                    color: GodropColors.orange,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: GodropColors.white, width: 1.5),
                  ),
                  child: Text(
                    count > 99 ? '99+' : '$count',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _CartIcon extends StatelessWidget {
  final IconData icon;
  final Color color;
  const _CartIcon({required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (ctx, state) {
        final count = state.activeCarts.fold(0, (s, c) => s + c.totalItems);
        return Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(icon, color: color, size: 22),
            if (count > 0)
              Positioned(
                top: -4,
                right: -6,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  constraints: const BoxConstraints(minWidth: 16),
                  decoration: BoxDecoration(
                    color: GodropColors.orange,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: GodropColors.white, width: 1.5),
                  ),
                  child: Text(
                    count > 99 ? '99+' : '$count',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
