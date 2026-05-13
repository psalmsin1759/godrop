import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

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
    ),
    _OnboardingData(
      title: 'Jollof, groceries,\n',
      titleAccent: 'gbogbo e.',
      body: 'Order from your favorite restaurants, supermarkets\nand shops — delivered hot & fresh in 30 min.',
      imagePath: 'assets/images/slide2.png',
    ),
    _OnboardingData(
      title: 'Book a truck. ',
      titleAccent: 'Move\nhouses.',
      body: 'From a small pickup to a 10-ton truck — verified\ndrivers, fixed prices, and extra hands if you need.',
      imagePath: 'assets/images/slide3.png',
      isLast: true,
    ),
  ];

  void _next() {
    if (_page < _pages.length - 1) {
      _controller.nextPage(duration: const Duration(milliseconds: 350), curve: Curves.easeInOut);
    } else {
      context.go('/auth/phone');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => context.go('/auth/phone'),
                child: const Text('Skip', style: TextStyle(color: GodropColors.slate, fontSize: 15)),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _pages.length,
                itemBuilder: (_, i) => _OnboardingPage(data: _pages[i]),
              ),
            ),
            GestureDetector(
              onTap: () => context.go('/auth/login'),
              child: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("Already have an account? ", style: TextStyle(fontSize: 14, color: GodropColors.slate)),
                    Text('Sign in', style: TextStyle(fontSize: 14, color: GodropColors.blue, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
              child: Row(
                children: [
                  Row(
                    children: List.generate(_pages.length, (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.only(right: 6),
                      width: i == _page ? 20 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: i == _page ? GodropColors.blue : GodropColors.mute.withOpacity(0.35),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    )),
                  ),
                  const Spacer(),
                  if (_pages[_page].isLast)
                    GestureDetector(
                      onTap: _next,
                      child: Container(
                        height: 52,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        decoration: BoxDecoration(
                          gradient: GodropColors.blueGradient,
                          borderRadius: BorderRadius.circular(100),
                          boxShadow: [
                            BoxShadow(
                              color: GodropColors.blue.withOpacity(0.35),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
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
                              color: GodropColors.blue.withOpacity(0.35),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
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
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  final _OnboardingData data;
  const _OnboardingPage({required this.data});

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
                    borderRadius: BorderRadius.circular(24),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Image.asset(
                    data.imagePath,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 28),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w700,
                color: GodropColors.ink,
                height: 1.2,
                letterSpacing: -0.5,
              ),
              children: [
                TextSpan(text: data.title),
                TextSpan(text: data.titleAccent, style: const TextStyle(color: GodropColors.orange)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(data.body, style: const TextStyle(fontSize: 15, color: GodropColors.slate, height: 1.5)),
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
  final bool isLast;
  const _OnboardingData({
    required this.title,
    required this.titleAccent,
    required this.body,
    required this.imagePath,
    this.isLast = false,
  });
}
