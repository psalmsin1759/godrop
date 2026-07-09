import 'package:flutter/material.dart';
import 'theme.dart';
import 'router.dart';

class GodropInvestorApp extends StatelessWidget {
  const GodropInvestorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GoDrop Invest',
      theme: InvestTheme.light,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
