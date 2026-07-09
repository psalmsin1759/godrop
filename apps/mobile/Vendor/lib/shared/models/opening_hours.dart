/// Weekly opening hours, mirroring the backend contract
/// (`apps/backend/src/utils/vendorHours.ts`): canonical 3-letter lowercase
/// day keys (sun–sat), `{open, close}` in HH:mm Africa/Lagos wall-clock,
/// null/absent = closed that day. Overnight ranges (close <= open) are valid.
class DayHours {
  final String open; // "08:00"
  final String close; // "22:00"

  const DayHours({required this.open, required this.close});

  bool get isOvernight {
    final o = _toMinutes(open);
    final c = _toMinutes(close);
    return c <= o;
  }

  static int _toMinutes(String hhmm) {
    final parts = hhmm.split(':');
    return (int.tryParse(parts[0]) ?? 0) * 60 +
        (parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0);
  }

  Map<String, dynamic> toJson() => {'open': open, 'close': close};
}

class OpeningHours {
  /// Canonical keys sun..sat; a missing or null entry means closed.
  final Map<String, DayHours?> days;

  /// True when the vendor has configured hours at least once — the platform
  /// treats an absent map as "no restriction" rather than "closed all week".
  final bool isConfigured;

  const OpeningHours({required this.days, this.isConfigured = true});

  /// Display order (week starts Monday for Nigerian vendors).
  static const displayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  static const dayLabels = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday',
  };

  // The backend accepts both 3-letter and full-name keys; stored data may use
  // either (onboarding sends full names), so normalize like the server does.
  static const _nameToKey = {
    'sun': 'sun', 'sunday': 'sun',
    'mon': 'mon', 'monday': 'mon',
    'tue': 'tue', 'tues': 'tue', 'tuesday': 'tue',
    'wed': 'wed', 'weds': 'wed', 'wednesday': 'wed',
    'thu': 'thu', 'thur': 'thu', 'thurs': 'thu', 'thursday': 'thu',
    'fri': 'fri', 'friday': 'fri',
    'sat': 'sat', 'saturday': 'sat',
  };

  factory OpeningHours.fromJson(Map<String, dynamic>? json) {
    if (json == null || json.isEmpty) {
      return const OpeningHours(days: {}, isConfigured: false);
    }
    final days = <String, DayHours?>{};
    json.forEach((key, value) {
      final dayKey = _nameToKey[key.trim().toLowerCase()];
      if (dayKey == null) return;
      if (value is Map<String, dynamic> &&
          value['open'] is String &&
          value['close'] is String) {
        days[dayKey] =
            DayHours(open: value['open'] as String, close: value['close'] as String);
      } else {
        days[dayKey] = null;
      }
    });
    return OpeningHours(days: days);
  }

  /// Serializes with canonical keys; closed days as explicit nulls so the
  /// server sees a complete week.
  Map<String, dynamic> toJson() => {
        for (final key in displayOrder) key: days[key]?.toJson(),
      };

  int get openDayCount =>
      displayOrder.where((k) => days[k] != null).length;

  /// Short human summary for settings rows, e.g. "Open 6 days · 08:00–22:00".
  String get summary {
    if (!isConfigured) return 'Not set — open anytime';
    final open = openDayCount;
    if (open == 0) return 'Closed all week';
    final firstOpen =
        days[displayOrder.firstWhere((k) => days[k] != null)]!;
    final uniform = displayOrder
        .where((k) => days[k] != null)
        .every((k) =>
            days[k]!.open == firstOpen.open &&
            days[k]!.close == firstOpen.close);
    final daysPart = open == 7 ? 'Every day' : 'Open $open days';
    return uniform
        ? '$daysPart · ${firstOpen.open}–${firstOpen.close}'
        : daysPart;
  }
}
