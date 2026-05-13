import 'package:flutter/material.dart';
import '../shared/services/user_prefs.dart';
import 'theme.dart';
import 'router.dart';

class ThemeController extends ChangeNotifier {
  static final ThemeController instance = ThemeController._();
  ThemeController._();

  bool _isDark = UserPrefs.isDarkMode;

  bool get isDark => _isDark;

  void setDarkMode(bool value) {
    _isDark = value;
    notifyListeners();
  }
}

class GodropCustomerApp extends StatefulWidget {
  const GodropCustomerApp({super.key});

  @override
  State<GodropCustomerApp> createState() => _GodropCustomerAppState();
}

class _GodropCustomerAppState extends State<GodropCustomerApp> {
  @override
  void initState() {
    super.initState();
    ThemeController.instance.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GoDrop',
      theme: GodropTheme.light,
      darkTheme: GodropTheme.dark,
      themeMode: ThemeController.instance.isDark ? ThemeMode.dark : ThemeMode.light,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
