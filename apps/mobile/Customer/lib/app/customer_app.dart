import 'package:flutter/material.dart';
import 'theme.dart';
import 'router.dart';

class GodropCustomerApp extends StatelessWidget {
  const GodropCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GoDrop',
      theme: GodropTheme.light,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
