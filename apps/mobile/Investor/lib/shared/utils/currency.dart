/// All investor endpoints speak integer Kobo (₦ × 100).
/// Display formatting mirrors the design: ₦213,500 / ₦213,500.00 / +₦13,500.
String formatKobo(int kobo, {bool decimals = false, bool sign = false}) {
  final naira = kobo / 100;
  final prefix = sign && kobo > 0 ? '+' : '';
  return '$prefix₦${_group(naira, decimals: decimals)}';
}

/// Compact form for chips: ₦250K, ₦1M.
String formatKoboCompact(int kobo) {
  final naira = kobo / 100;
  if (naira >= 1000000) {
    final m = naira / 1000000;
    return '₦${m == m.roundToDouble() ? m.toInt() : m.toStringAsFixed(1)}M';
  }
  if (naira >= 1000) {
    final k = naira / 1000;
    return '₦${k == k.roundToDouble() ? k.toInt() : k.toStringAsFixed(1)}K';
  }
  return '₦${naira.toInt()}';
}

String _group(double naira, {bool decimals = false}) {
  final fixed = naira.toStringAsFixed(decimals ? 2 : (naira == naira.roundToDouble() ? 0 : 2));
  final parts = fixed.split('.');
  final digits = parts[0];
  final buf = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buf.write(',');
    buf.write(digits[i]);
  }
  return parts.length > 1 ? '$buf.${parts[1]}' : buf.toString();
}

/// "3200 bps" → "32%"; "540 bps" → "5.4%".
String formatBps(int bps) {
  final pct = bps / 100;
  return '${pct == pct.roundToDouble() ? pct.toInt() : pct.toStringAsFixed(1)}%';
}

/// Parse a keypad string like "250,000" into Kobo.
int parseNairaToKobo(String input) {
  final cleaned = input.replaceAll(',', '').replaceAll('₦', '').trim();
  if (cleaned.isEmpty) return 0;
  final naira = double.tryParse(cleaned) ?? 0;
  return (naira * 100).round();
}
