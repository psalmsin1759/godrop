import 'package:shared_preferences/shared_preferences.dart';

class RiderPrefs {
  RiderPrefs._();

  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static bool get isOnboarded => _prefs.getBool('rider_onboarded') ?? false;
  static String? get riderId => _prefs.getString('rider_id');
  static String? get riderName => _prefs.getString('rider_name');
  static String? get riderPhone => _prefs.getString('rider_phone');
  static String? get riderAvatar => _prefs.getString('rider_avatar');

  static Future<void> saveProfile({
    required String id,
    required String name,
    required String phone,
    String? avatarUrl,
  }) async {
    await _prefs.setBool('rider_onboarded', true);
    await _prefs.setString('rider_id', id);
    await _prefs.setString('rider_name', name);
    await _prefs.setString('rider_phone', phone);
    if (avatarUrl != null) await _prefs.setString('rider_avatar', avatarUrl);
  }

  static Future<void> clear() async {
    await _prefs.remove('rider_onboarded');
    await _prefs.remove('rider_id');
    await _prefs.remove('rider_name');
    await _prefs.remove('rider_phone');
    await _prefs.remove('rider_avatar');
  }
}
