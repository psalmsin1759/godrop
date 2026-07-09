import 'package:flutter/material.dart';
import 'theme.dart';
import 'router.dart';

class GodropVendorApp extends StatelessWidget {
  const GodropVendorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GoDrop Vendor',
      theme: GodropTheme.light,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
