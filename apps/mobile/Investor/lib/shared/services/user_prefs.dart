import 'package:shared_preferences/shared_preferences.dart';

/// Lightweight session cache (non-sensitive) for instant UI on cold start.
class UserPrefs {
  UserPrefs._();

  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<void> saveSession({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
  }) async {
    await _prefs.setString('inv_first_name', firstName);
    await _prefs.setString('inv_last_name', lastName);
    await _prefs.setString('inv_email', email);
    await _prefs.setString('inv_phone', phone);
  }

  static String get firstName => _prefs.getString('inv_first_name') ?? '';
  static String get lastName => _prefs.getString('inv_last_name') ?? '';
  static String get email => _prefs.getString('inv_email') ?? '';
  static String get phone => _prefs.getString('inv_phone') ?? '';

  static bool get seenOnboarding => _prefs.getBool('inv_seen_onboarding') ?? false;
  static Future<void> setSeenOnboarding() => _prefs.setBool('inv_seen_onboarding', true);

  static bool get balanceHidden => _prefs.getBool('inv_balance_hidden') ?? false;
  static Future<void> setBalanceHidden(bool v) => _prefs.setBool('inv_balance_hidden', v);

  static Future<void> clear() async {
    await _prefs.remove('inv_first_name');
    await _prefs.remove('inv_last_name');
    await _prefs.remove('inv_email');
    await _prefs.remove('inv_phone');
  }
}
