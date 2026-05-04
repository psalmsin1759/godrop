import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class GodropColors {
  GodropColors._();

  static const Color ink = Color(0xFF0B1F4A);
  static const Color slate = Color(0xFF4A5068);
  static const Color mute = Color(0xFF8A90A3);
  static const Color blue = Color(0xFF1E5FFF);
  static const Color blueDark = Color(0xFF1240CC);
  static const Color orange = Color(0xFFFF6A2C);
  static const Color white = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF5F4F2);
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE8E6E1);
  static const Color divider = Color(0xFFF0EEE9);
  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFEF4444);

  static const LinearGradient blueGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF0F2680)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient splashGradient = LinearGradient(
    colors: [Color(0xFF1A3CCC), Color(0xFF0D1F6E)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient orangeGradient = LinearGradient(
    colors: [Color(0xFFFF8C42), Color(0xFFFF6A2C)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class GodropTextStyles {
  GodropTextStyles._();

  static TextTheme get textTheme => TextTheme(
        displayLarge: GoogleFonts.inter(
            fontSize: 57, fontWeight: FontWeight.w400, color: GodropColors.ink),
        displayMedium: GoogleFonts.inter(
            fontSize: 45, fontWeight: FontWeight.w400, color: GodropColors.ink),
        displaySmall: GoogleFonts.inter(
            fontSize: 36, fontWeight: FontWeight.w400, color: GodropColors.ink),
        headlineLarge: GoogleFonts.inter(
            fontSize: 32, fontWeight: FontWeight.w700, color: GodropColors.ink),
        headlineMedium: GoogleFonts.inter(
            fontSize: 28, fontWeight: FontWeight.w700, color: GodropColors.ink),
        headlineSmall: GoogleFonts.inter(
            fontSize: 24, fontWeight: FontWeight.w600, color: GodropColors.ink),
        titleLarge: GoogleFonts.inter(
            fontSize: 22, fontWeight: FontWeight.w600, color: GodropColors.ink),
        titleMedium: GoogleFonts.inter(
            fontSize: 16, fontWeight: FontWeight.w600, color: GodropColors.ink),
        titleSmall: GoogleFonts.inter(
            fontSize: 14, fontWeight: FontWeight.w500, color: GodropColors.ink),
        bodyLarge: GoogleFonts.inter(
            fontSize: 16, fontWeight: FontWeight.w400, color: GodropColors.ink),
        bodyMedium: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: GodropColors.slate),
        bodySmall: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w400,
            color: GodropColors.mute),
        labelLarge: GoogleFonts.inter(
            fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink),
        labelMedium: GoogleFonts.inter(
            fontSize: 12, fontWeight: FontWeight.w500, color: GodropColors.ink),
        labelSmall: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: GodropColors.mute),
      );
}

class GodropTheme {
  GodropTheme._();

  static ThemeData get light {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: GodropColors.background,
      colorScheme: base.colorScheme.copyWith(
        primary: GodropColors.blue,
        secondary: GodropColors.orange,
        surface: GodropColors.card,
        onPrimary: GodropColors.white,
      ),
      textTheme: GodropTextStyles.textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: GodropColors.white,
        foregroundColor: GodropColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.inter(
          color: GodropColors.ink,
          fontSize: 17,
          fontWeight: FontWeight.w600,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: GodropColors.divider,
        space: 1,
        thickness: 1,
      ),
      cardTheme: const CardThemeData(
        color: GodropColors.card,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
    );
  }
}
