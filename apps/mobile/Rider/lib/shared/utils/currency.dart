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
