import 'package:flutter/material.dart';
import 'theme.dart';
import 'router.dart';

class RiderApp extends StatelessWidget {
  const RiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GoDrop Rider',
      theme: GodropTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
