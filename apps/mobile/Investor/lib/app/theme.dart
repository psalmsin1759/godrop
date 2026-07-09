import 'package:flutter/material.dart';

/// GoDrop Invest — light theme tokens.
/// Mirrors the `body.theme-light` CSS variables in the design kit
/// (`GoDrop Invest - App.html` / `invest-kit.jsx`).
class InvestColors {
  InvestColors._();

  // Themed surfaces (light mode)
  static const Color bg = Color(0xFFEEF0F4);
  static const Color raise = Color(0xFFFFFFFF);
  static const Color raise2 = Color(0xFFF6F7F9);
  static const Color raise3 = Color(0xFFEAEDF2);
  static const Color line = Color(0x170F172A); // rgba(15,23,42,0.09)
  static const Color line2 = Color(0x290F172A); // rgba(15,23,42,0.16)
  static const Color text = Color(0xFF0B1020);
  static const Color sub = Color(0x990B1020); // rgba(11,16,32,0.60)
  static const Color mute = Color(0x6B0B1020); // rgba(11,16,32,0.42)
  static const Color navBg = Color(0xFFFFFFFF);

  // Brand — identical in both themes
  static const Color blue = Color(0xFF1E5FFF);
  static const Color blueBright = Color(0xFF2E68FF);
  static const Color blueDeep = Color(0xFF0B3AD6);
  static const Color blueSoft = Color(0x241E5FFF); // rgba(30,95,255,0.14)
  static const Color orange = Color(0xFFFF6A2C);
  static const Color orangeDeep = Color(0xFFE0531A);
  static const Color orangeSoft = Color(0x29FF6A2C); // rgba(255,106,44,0.16)
  static const Color green = Color(0xFF22C486);
  static const Color greenSoft = Color(0x2922C486); // rgba(34,196,134,0.16)
  static const Color red = Color(0xFFFF453A);
  static const Color gold = Color(0xFFF5B740);
  static const Color goldSoft = Color(0x29F5B740);

  static const LinearGradient card = LinearGradient(
    colors: [Color(0xFF2E68FF), Color(0xFF1B4DE4), Color(0xFF123CC0)],
    stops: [0.0, 0.55, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cta = LinearGradient(
    colors: [Color(0xFF2E68FF), Color(0xFF1140C8)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient ctaOrange = LinearGradient(
    colors: [Color(0xFFFF8A4C), Color(0xFFE0531A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGreen = LinearGradient(
    colors: [Color(0xFF2FC97F), Color(0xFF17915A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// `--gdi-carddark` in light mode — a white → cool-grey raise gradient.
  static const LinearGradient cardDark = LinearGradient(
    colors: [Color(0xFFFFFFFF), Color(0xFFEDF0F5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gold2 = LinearGradient(
    colors: [Color(0xFFF5C542), Color(0xFFD89A1E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static List<BoxShadow> get ctaShadow => [
        BoxShadow(
          color: blue.withValues(alpha: 0.35),
          blurRadius: 22,
          offset: const Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: const Color(0xFF143CC8).withValues(alpha: 0.28),
          blurRadius: 34,
          offset: const Offset(0, 14),
        ),
      ];
}

class InvestTheme {
  InvestTheme._();

  /// Light mode only — the app ships light-first per the design brief.
  static ThemeData get light {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: InvestColors.bg,
      colorScheme: base.colorScheme.copyWith(
        primary: InvestColors.blue,
        secondary: InvestColors.orange,
        surface: InvestColors.raise,
        onPrimary: Colors.white,
        error: InvestColors.red,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: InvestColors.bg,
        foregroundColor: InvestColors.text,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          color: InvestColors.text,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: InvestColors.line,
        space: 1,
        thickness: 1,
      ),
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: InvestColors.blue,
      ),
      textTheme: base.textTheme.apply(
        bodyColor: InvestColors.text,
        displayColor: InvestColors.text,
      ),
    );
  }
}
