/// Formats a Naira amount (already a decimal, not Kobo) for display, e.g. `₦1,500.00`.
String formatNaira(double naira, {int decimals = 2}) {
  final str = naira.toStringAsFixed(decimals);
  final parts = str.split('.');
  final intPart = parts[0].replaceAllMapped(
    RegExp(r'\B(?=(\d{3})+(?!\d))'),
    (_) => ',',
  );
  return decimals > 0 ? '₦$intPart.${parts[1]}' : '₦$intPart';
}

/// Formats an integer Kobo amount for display as Naira, e.g. `₦1,500.00`.
/// Catalog, order, and analytics endpoints speak Kobo; wallet speaks Naira.
String formatKobo(int kobo, {int decimals = 2}) =>
    formatNaira(kobo / 100, decimals: decimals);
