import 'package:shared_preferences/shared_preferences.dart';

/// Lightweight local cache of the signed-in vendor admin, so the shell can
/// render name/role/store immediately while the profile refreshes remotely.
class UserPrefs {
  UserPrefs._();

  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<void> saveSession({
    required String name,
    required String email,
    required String role,
    required String vendorName,
  }) async {
    await _prefs.setString('admin_name', name);
    await _prefs.setString('admin_email', email);
    await _prefs.setString('admin_role', role);
    await _prefs.setString('vendor_name', vendorName);
  }

  static String get adminName => _prefs.getString('admin_name') ?? '';
  static String get adminEmail => _prefs.getString('admin_email') ?? '';
  static String get adminRole => _prefs.getString('admin_role') ?? 'STAFF';
  static String get vendorName => _prefs.getString('vendor_name') ?? '';

  static Future<void> clear() async {
    await _prefs.clear();
  }
}
