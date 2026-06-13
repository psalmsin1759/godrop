import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  static const _pages = [
    _OnboardingData(
      title: 'Send parcels across\ntown ',
      titleAccent: 'in minutes.',
      body: 'Book a rider at your doorstep for same-day delivery\n— pay with card, transfer or cash on arrival.',
      imagePath: 'assets/images/slide1.png',
      icon: Icons.local_shipping_rounded,
      accent: GodropColors.blue,
    ),
    _OnboardingData(
      title: 'Jollof, groceries,\n',
      titleAccent: 'gbogbo e.',
      body: 'Order from your favorite restaurants, supermarkets\nand shops — delivered hot & fresh in 30 min.',
      imagePath: 'assets/images/slide2.png',
      icon: Icons.restaurant_rounded,
      accent: GodropColors.orange,
    ),
    _OnboardingData(
      title: 'Book a truck. ',
      titleAccent: 'Move\nhouses.',
      body: 'From a small pickup to a 10-ton truck — verified\ndrivers, fixed prices, and extra hands if you need.',
      imagePath: 'assets/images/slide3.png',
      icon: Icons.home_work_rounded,
      accent: GodropColors.ink,
      isLast: true,
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_page < _pages.length - 1) {
      _controller.nextPage(duration: const Duration(milliseconds: 380), curve: Curves.easeOutCubic);
    } else {
      context.go('/auth/phone');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Stack(
        children: [
          const BackgroundBlobs(topColor: GodropColors.blue, bottomColor: GodropColors.orange),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: GodropColors.card,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(color: GodropColors.ink.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, 3)),
                          ],
                        ),
                        child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
                      ),
                      GestureDetector(
                        onTap: () => context.go('/auth/phone'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                          decoration: BoxDecoration(
                            color: GodropColors.card,
                            borderRadius: BorderRadius.circular(100),
                            boxShadow: [
                              BoxShadow(color: GodropColors.ink.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, 3)),
                            ],
                          ),
                          child: const Text(
                            'Skip',
                            style: TextStyle(color: GodropColors.slate, fontSize: 13, fontWeight: FontWeight.w600, letterSpacing: 0.2),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: PageView.builder(
                    controller: _controller,
                    onPageChanged: (i) => setState(() => _page = i),
                    itemCount: _pages.length,
                    itemBuilder: (_, i) => _OnboardingPage(data: _pages[i], index: i, total: _pages.length),
                  ),
                ),
                GestureDetector(
                  onTap: () => context.go('/auth/login'),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                    decoration: BoxDecoration(
                      color: GodropColors.blue.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(fontSize: 14, color: GodropColors.slate),
                        children: [
                          TextSpan(text: 'Already have an account? '),
                          TextSpan(text: 'Sign in', style: TextStyle(color: GodropColors.blue, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                  child: Row(
                    children: [
                      Row(
                        children: List.generate(_pages.length, (i) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeOut,
                          margin: const EdgeInsets.only(right: 6),
                          width: i == _page ? 28 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            gradient: i == _page ? GodropColors.blueGradient : null,
                            color: i == _page ? null : GodropColors.border,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        )),
                      ),
                      const Spacer(),
                      if (_pages[_page].isLast)
                        GestureDetector(
                          onTap: _next,
                          child: Container(
                            height: 52,
                            padding: const EdgeInsets.symmetric(horizontal: 22),
                            decoration: BoxDecoration(
                              gradient: GodropColors.blueGradient,
                              borderRadius: BorderRadius.circular(100),
                              boxShadow: [
                                BoxShadow(
                                  color: GodropColors.blue.withValues(alpha: 0.35),
                                  blurRadius: 16,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Get started',
                                  style: TextStyle(
                                    color: GodropColors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_forward_rounded, color: GodropColors.white, size: 18),
                              ],
                            ),
                          ),
                        )
                      else
                        GestureDetector(
                          onTap: _next,
                          child: Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              gradient: GodropColors.blueGradient,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: GodropColors.blue.withValues(alpha: 0.35),
                                  blurRadius: 16,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: const Icon(Icons.arrow_forward_rounded, color: GodropColors.white, size: 22),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  final _OnboardingData data;
  final int index;
  final int total;
  const _OnboardingPage({required this.data, required this.index, required this.total});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Align(
              alignment: Alignment.center,
              child: FractionallySizedBox(
                heightFactor: 0.82,
                widthFactor: 1.0,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0EDE8),
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(color: GodropColors.ink.withValues(alpha: 0.10), blurRadius: 28, offset: const Offset(0, 14)),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.asset(data.imagePath, fit: BoxFit.cover),
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Container(
                          height: 100,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [GodropColors.ink.withValues(alpha: 0.32), GodropColors.ink.withValues(alpha: 0.0)],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 16,
                        top: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: GodropColors.card.withValues(alpha: 0.92),
                            borderRadius: BorderRadius.circular(100),
                          ),
                          child: Text(
                            '${index + 1} / $total',
                            style: const TextStyle(color: GodropColors.ink, fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                      Positioned(
                        left: 16,
                        bottom: 16,
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: data.accent,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: data.accent.withValues(alpha: 0.4), blurRadius: 14, offset: const Offset(0, 6)),
                            ],
                          ),
                          child: Icon(data.icon, color: GodropColors.white, size: 22),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 28),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.w800,
                color: GodropColors.ink,
                height: 1.2,
                letterSpacing: -0.6,
              ),
              children: [
                TextSpan(text: data.title),
                TextSpan(text: data.titleAccent, style: TextStyle(color: data.accent)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(data.body, style: const TextStyle(fontSize: 15, color: GodropColors.slate, height: 1.6)),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _OnboardingData {
  final String title;
  final String titleAccent;
  final String body;
  final String imagePath;
  final IconData icon;
  final Color accent;
  final bool isLast;
  const _OnboardingData({
    required this.title,
    required this.titleAccent,
    required this.body,
    required this.imagePath,
    required this.icon,
    required this.accent,
    this.isLast = false,
  });
}
