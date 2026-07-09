const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/// `Jun 28 · 2:40 PM`, or `Today · 9:12 AM` for same-day timestamps.
String formatDateTime(String iso) {
  final dt = DateTime.tryParse(iso)?.toLocal();
  if (dt == null) return iso;
  final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
  final ampm = dt.hour >= 12 ? 'PM' : 'AM';
  final min = dt.minute.toString().padLeft(2, '0');
  final now = DateTime.now();
  final day = (dt.year == now.year && dt.month == now.month && dt.day == now.day)
      ? 'Today'
      : '${_months[dt.month - 1]} ${dt.day}';
  return '$day · $h12:$min $ampm';
}

/// `Jul 12` — short month-day.
String formatMonthDay(String? iso) {
  final dt = iso == null ? null : DateTime.tryParse(iso)?.toLocal();
  if (dt == null) return '—';
  return '${_months[dt.month - 1]} ${dt.day}';
}

/// `Aug 1, 2026` — full date.
String formatDate(String? iso) {
  final dt = iso == null ? null : DateTime.tryParse(iso)?.toLocal();
  if (dt == null) return '—';
  return '${_months[dt.month - 1]} ${dt.day}, ${dt.year}';
}

/// `Jul 2027` — month-year, used for maturity.
String formatMonthYear(String? iso) {
  final dt = iso == null ? null : DateTime.tryParse(iso)?.toLocal();
  if (dt == null) return '—';
  return '${_months[dt.month - 1]} ${dt.year}';
}

/// Whole days until [iso]; 0 when past or unparseable.
int daysUntil(String? iso) {
  final dt = iso == null ? null : DateTime.tryParse(iso)?.toLocal();
  if (dt == null) return 0;
  final diff = dt.difference(DateTime.now()).inDays;
  return diff < 0 ? 0 : diff;
}

/// Relative time for feeds, e.g. `2 min ago`, `1 hr ago`, `Yesterday`.
String timeAgo(String iso) {
  final dt = DateTime.tryParse(iso)?.toLocal();
  if (dt == null) return iso;
  final diff = DateTime.now().difference(dt);
  if (diff.inMinutes < 1) return 'just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
  if (diff.inHours < 24) return '${diff.inHours} hr ago';
  if (diff.inDays == 1) return 'Yesterday';
  if (diff.inDays < 7) return '${diff.inDays} days ago';
  return formatMonthDay(iso);
}
