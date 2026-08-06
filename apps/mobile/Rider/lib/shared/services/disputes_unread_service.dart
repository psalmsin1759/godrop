import 'package:flutter/foundation.dart';
import '../api/client/dio_client.dart';

/// Tracks how many of the rider's disputes have an admin reply or
/// resolution they haven't viewed yet. Drives the badge on the bottom-nav
/// Profile tab and the "My reports" entry point.
class DisputesUnreadService {
  DisputesUnreadService._();

  static final ValueNotifier<int> count = ValueNotifier<int>(0);

  static Future<void> refresh() async {
    try {
      final response = await DioClient.instance.get('/rider/disputes/unread-count');
      count.value = (response.data['data']['count'] as num?)?.toInt() ?? 0;
    } catch (_) {
      // Leave the last known count on failure — a stale badge beats a
      // flickering one on transient network errors.
    }
  }

  static void reset() => count.value = 0;
}
