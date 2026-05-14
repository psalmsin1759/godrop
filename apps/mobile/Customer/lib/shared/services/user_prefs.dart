import 'package:hive/hive.dart';

class UserPrefs {
  static Box? _box;

  static Future<void> init() async {
    _box = await Hive.openBox('user_prefs');
  }

  static String get name => _box?.get('name', defaultValue: '') ?? '';
  static String get email => _box?.get('email', defaultValue: '') ?? '';
  static bool get isOnboarded => _box?.get('onboarded', defaultValue: false) ?? false;

  static Future<void> saveProfile({required String name, required String email}) async {
    await _box?.put('name', name);
    await _box?.put('email', email);
    await _box?.put('onboarded', true);
  }

  static int get walletBalanceKobo => _box?.get('wallet_balance_kobo', defaultValue: 0) ?? 0;
  static Future<void> saveWalletBalance(int kobo) async => _box?.put('wallet_balance_kobo', kobo);

  static int get orderCount => _box?.get('order_count', defaultValue: 0) ?? 0;
  static Future<void> saveOrderCount(int count) async => _box?.put('order_count', count);

  static String? get avatarUrl => _box?.get('avatar_url');
  static Future<void> saveAvatarUrl(String? url) async {
    if (url != null) {
      await _box?.put('avatar_url', url);
    } else {
      await _box?.delete('avatar_url');
    }
  }

  static String? get fcmToken => _box?.get('fcm_token');

  static Future<void> saveFcmToken(String token) async =>
      _box?.put('fcm_token', token);

  static Future<void> clearFcmToken() async => _box?.delete('fcm_token');

  // ── Global delivery address ──────────────────────────────────────────────────
  static String get deliveryAddress =>
      _box?.get('delivery_address', defaultValue: '') ?? '';

  static Future<void> saveDeliveryAddress(String address) async =>
      _box?.put('delivery_address', address);

  static Future<void> clear() async => _box?.clear();
}
