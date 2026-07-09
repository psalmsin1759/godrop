import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

/// Design-kit `ITabBar` — Home · Safe · My Assets · Transaction · Profile.
/// Active tab renders as a 52×32 blue pill with a white icon.
class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.shell});

  final StatefulNavigationShell shell;

  static const _tabs = [
    (label: 'Home', icon: Icons.home_outlined, active: Icons.home),
    (label: 'Safe', icon: Icons.savings_outlined, active: Icons.savings),
    (label: 'My Assets', icon: Icons.local_mall_outlined, active: Icons.local_mall),
    (label: 'Transaction', icon: Icons.receipt_long_outlined, active: Icons.receipt_long),
    (label: 'Profile', icon: Icons.person_outline, active: Icons.person),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: InvestColors.navBg,
          border: Border(top: BorderSide(color: InvestColors.line)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 10, 6, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final on = shell.currentIndex == i;
                return GestureDetector(
                  onTap: () => shell.goBranch(i, initialLocation: on),
                  behavior: HitTestBehavior.opaque,
                  child: SizedBox(
                    width: 64,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          width: 52,
                          height: 32,
                          decoration: BoxDecoration(
                            color: on ? InvestColors.blue : Colors.transparent,
                            borderRadius: BorderRadius.circular(11),
                          ),
                          child: Icon(
                            on ? tab.active : tab.icon,
                            size: 22,
                            color: on ? Colors.white : InvestColors.mute,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: on ? FontWeight.w700 : FontWeight.w500,
                            color: on ? InvestColors.blueBright : InvestColors.mute,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
