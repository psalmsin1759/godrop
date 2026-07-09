import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/services/user_prefs.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/invest_button.dart';

/// Screens 02–04 — the 3-slide onboarding carousel:
/// own assets → monthly income → withdraw anytime.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    await UserPrefs.setSeenOnboarding();
    if (!mounted) return;
    context.go('/auth/sign-up');
  }

  void _next() {
    if (_index == 2) {
      _finish();
    } else {
      _controller.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 26),
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: _finish,
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.sub,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: PageView(
                  controller: _controller,
                  onPageChanged: (i) => setState(() => _index = i),
                  children: const [
                    _Slide(
                      kicker: 'ASSET-BACKED INVESTING',
                      title: 'Own a piece\nof the road',
                      body:
                          'Fund Keke tricycles, delivery bikes, buses and cars operated by vetted GoDrop riders — real assets working for you.',
                      art: _OwnAssetsArt(),
                    ),
                    _Slide(
                      kicker: 'PASSIVE INCOME',
                      title: 'Get paid\nevery month',
                      body:
                          'Your share of the earnings lands in your GoDrop wallet monthly. Track each payout and watch your capital grow.',
                      art: _MonthlyIncomeArt(),
                    ),
                    _Slide(
                      kicker: 'FULL CONTROL',
                      title: 'Withdraw\nanytime',
                      body:
                          'Cash out your monthly payouts to any Nigerian bank, or lock them in Flow Safe to earn even more interest.',
                      art: _WithdrawArt(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 26),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Dots(active: _index),
                  SizedBox(
                    width: 150,
                    child: InvestButton(
                      label: _index == 2 ? 'Get started' : 'Next',
                      trailingIcon: Icons.arrow_forward,
                      onPressed: _next,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Slide extends StatelessWidget {
  const _Slide({
    required this.kicker,
    required this.title,
    required this.body,
    required this.art,
  });

  final String kicker;
  final String title;
  final String body;
  final Widget art;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: Center(child: art)),
        Text(
          kicker,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.4,
            color: InvestColors.orange,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.6,
            height: 1.15,
            color: InvestColors.text,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          body,
          style: const TextStyle(
            fontSize: 14.5,
            height: 1.55,
            color: InvestColors.sub,
          ),
        ),
      ],
    );
  }
}

class _ArtCircle extends StatelessWidget {
  const _ArtCircle({required this.color, required this.child});

  final Color color;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      height: 260,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 260,
            height: 260,
            decoration: BoxDecoration(shape: BoxShape.circle, color: color),
          ),
          Container(
            width: 190,
            height: 190,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: InvestColors.line2),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _OwnAssetsArt extends StatelessWidget {
  const _OwnAssetsArt();

  @override
  Widget build(BuildContext context) {
    return _ArtCircle(
      color: InvestColors.blueSoft,
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 150,
            height: 130,
            decoration: BoxDecoration(
              gradient: InvestColors.card,
              borderRadius: BorderRadius.circular(24),
              boxShadow: InvestColors.cardShadow,
            ),
            child: const Icon(Icons.electric_rickshaw, size: 72, color: Colors.white),
          ),
          const Positioned(
            top: -36,
            right: -42,
            child: Icon(Icons.monetization_on, size: 38, color: InvestColors.gold),
          ),
          const Positioned(
            bottom: -32,
            left: -48,
            child: Icon(Icons.monetization_on, size: 28, color: InvestColors.gold),
          ),
        ],
      ),
    );
  }
}

class _MonthlyIncomeArt extends StatelessWidget {
  const _MonthlyIncomeArt();

  @override
  Widget build(BuildContext context) {
    return _ArtCircle(
      color: InvestColors.greenSoft,
      child: Container(
        width: 200,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: InvestColors.line),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.12),
              blurRadius: 50,
              offset: const Offset(0, 20),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'THIS MONTH',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: InvestColors.mute,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              '+₦72,400',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: InvestColors.text,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 60,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [30, 44, 38, 58, 50, 72].asMap().entries.map((e) {
                  final last = e.key == 5;
                  return Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      height: 60 * e.value / 100,
                      decoration: BoxDecoration(
                        color: last ? InvestColors.green : InvestColors.raise3,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WithdrawArt extends StatelessWidget {
  const _WithdrawArt();

  @override
  Widget build(BuildContext context) {
    return _ArtCircle(
      color: InvestColors.orangeSoft,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 170,
            height: 106,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: InvestColors.card,
              borderRadius: BorderRadius.circular(18),
              boxShadow: InvestColors.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.9),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.account_balance_wallet_outlined,
                      size: 20, color: InvestColors.blue),
                ),
                const Spacer(),
                const Text(
                  '•••• 2290',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 2,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: -26,
            right: -22,
            child: Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: InvestColors.orange,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: InvestColors.orangeDeep.withValues(alpha: 0.5),
                    blurRadius: 26,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: const Icon(Icons.account_balance, size: 28, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
